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

contract CC721 is ERC721Burnable, Ownable {
    using Counters for Counters.Counter;
    using Bytes for address;
    using xibcStrings for string;

    // cross chain nft info
    struct Info {
        uint256 id; // id in source chain
        string srcChain; //source chain name
    }

    Counters.Counter private _tokenIdCounter;

    // cross-chain component
    IRCC rcc;
    // nft contracts whitelist
    // key:bytes keccak256((srcChain.concat(contractAddress))
    mapping(bytes32 => bool) whitelist;
    // mark nft from otherchain
    // tokenID => another chain id

    mapping(uint256 => Info) enter;
    // mark nft out to otherchain
    mapping(uint256 => address) out;

    // modifier onlyWhitelist(RCCDataTypes.RCCPacketData memory packet) {
    //     require(
    //         whitelist[getWhiteListKey(packet.srcChain, packet.sender)],
    //         "contract no permission"
    //     );
    //     _;
    // }

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
        // check permission
        require(_isApprovedOrOwner(msg.sender, id), "no permission");

        // check nft type
        uint256 crossChainID;
        if (enter[id].id != 0) {
            require(
                destChain.equals(enter[id].srcChain),
                "cross-chain must be backto srcChain"
            );
            //burn
            _burn(id);
            crossChainID = enter[id].id;
            delete enter[id];
        } else {
            // lock
            _transfer(msg.sender, address(rcc), id);
            crossChainID = id;
            out[id] = msg.sender;
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
        // check packet if from trusted nft contract
        RCCDataTypes.RCCPacketData memory packet = rcc.getLatestPacket();
        require(
            whitelist[getWhiteListKey(packet.srcChain, packet.sender)],
            "contract no permission"
        );

        // back
        if (out[id] != address(0)) {
            _transfer(msg.sender, out[id], id);
            delete out[id];
        } else {
            //cross-chain to
            uint256 _id = _tokenIdCounter.current();
            _tokenIdCounter.increment();
            enter[_id] = Info(id, packet.srcChain);
        }
    }

    function getWhiteListKey(string memory srcChain, string memory sender)
        internal
        pure
        returns (bytes32)
    {
        return keccak256(bytes(srcChain.strConcat(sender)));
    }
}
