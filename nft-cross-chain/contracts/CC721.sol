// SPDX-License-Identifier: Apache License 2.0
pragma solidity 0.6.8;
pragma experimental ABIEncoderV2;

// import "xibc-contracts/evm/contracts/libraries/utils/Strings.sol";
import "xibc-contracts/evm/contracts/interfaces/IRCC.sol";
import "xibc-contracts/evm/contracts/libraries/app/RCC.sol";
import "xibc-contracts/evm/contracts/libraries/packet/Packet.sol";
import "xibc-contracts/evm/contracts/libraries/utils/Bytes.sol";
import {Strings as xibcStrings} from "xibc-contracts/evm/contracts/libraries/utils/Strings.sol";

import "@openzeppelin/contracts/token/ERC721/ERC721Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";





contract CC721 is ERC721Burnable,Ownable{
    using Counters for Counters.Counter;
    using Bytes for address;
    using xibcStrings for string;

    Counters.Counter private _tokenIdCounter;

    // cross-chain component
    IRCC rcc;
    // nft contracts whitelist
    // key:bytes keccak256((srcChain.concat(contractAddress))
    mapping(bytes32 => bool) whitelist;
    // mark cross-chain nft
    // tokenID => another chain id
    mapping(uint256 => uint256) nextDoorIDs;

    /**
     * @param _rcc remote contract call address
     */
    constructor(address _rcc) public ERC721("CC721", "CC") {
        rcc = IRCC(_rcc);
        // init to 1
        _tokenIdCounter.increment();
    }

    /**
     * @notice mint token to 'to'
     * @param to address you want to mint to
     */
    function safeMint(address to) public {
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        _safeMint(to, tokenId);
    }

    //-------------- cross-chain methods --------------

    /**
     * @notice crossChain is
     * @param id is nft id
     * @param target target chain's target contract
     * @param destChain target chain name
     * @param feeAddr token you want to give relayer
     * @param feeAmount token amount you want to give
     * todo RCCData & feedata pass from outside
     */
    function crossChain(
        uint256 id,
        address target,
        string calldata destChain,
        // string calldata relayChain,
        address feeAddr,
        uint256 feeAmount
    ) external payable {
        // check
        //           struct RCCPacketData {
        //         string srcChain;
        //         string destChain;
        //         uint64 sequence;
        //         string sender;
        //         string contractAddress;
        //         bytes data;
        //     }
        // }
        RCCDataTypes.RCCPacketData memory packet = rcc.getLatestPacket();

        require(
            whitelist[getWhiteListKey(packet.srcChain, packet.sender)],
            "contract no permission"
        );

        // check permission
        require(_isApprovedOrOwner(msg.sender, id), "no permission");

        // check nft type
        uint256 crossChainID;
        if (nextDoorIDs[id] != 0) {
            //burn
            _burn(id);
            crossChainID = nextDoorIDs[id];
            delete nextDoorIDs[id];
        } else {
            // lock
            _transfer(msg.sender, address(this), id);
            crossChainID = id;
        }
        // construct rcc req data
        bytes memory reqBytes = abi.encodeWithSelector(
            this.onCrossChain.selector,
            crossChainID
        );
        RCCDataTypes.RCCData memory rccData = RCCDataTypes.RCCData(
            target.addressToString(),
            reqBytes,
            destChain,
            ""
        );
        PacketTypes.Fee memory fee = PacketTypes.Fee(feeAddr, feeAmount);

        rcc.sendRemoteContractCall{value: msg.value}(rccData, fee);
    }

    function onCrossChain(uint256 id) external {
        // back
        if (ownerOf(id) == address(this)) {
            _transfer(address(this), msg.sender, id);
        } else {}

        // new to
    }

    function getWhiteListKey(string memory srcChain, string memory sender)
        internal
        pure
        returns (bytes32)
    {
        return keccak256(bytes(srcChain.strConcat(sender)));
    }
}
