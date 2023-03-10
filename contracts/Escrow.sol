//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

interface IERC721 {
    function transferFrom(
        address _from,
        address _to,
        uint256 _id
    ) external;
}

contract Escrow {
    address payable public seller;
    address public inspector;
    address public lender;
    address public nftAddress;

    modifier onlySeller(){
        require(msg.sender==seller,"message sender is not a seller");
        _;
    }

    modifier onlyBuyer(uint256 _nftID){
        require(msg.sender==buyer[_nftID],"message sender is not a buyer");
        _;
    }

    modifier onlyInsperctor(){
        require(msg.sender == inspector,"message sender in not inspector");
        _;
    }

    

    mapping (uint256 => bool) public isListed;
    mapping (uint256 => uint256) public purchasePrice;
    mapping (uint256 => address) public buyer;
    mapping (uint256 => uint256) public escrowAmount;
    mapping (uint256 => mapping(address => bool)) public approval;
    mapping (uint256 => bool) public inspectionPassed;
    

    constructor(
        address _nftAddress,
        address payable _seller,
        address _inspector,
        address _lender
    ) {
        nftAddress = _nftAddress;
        seller = _seller;
        inspector = _inspector;
        lender = _lender;
    }


    function list(
        uint256 _nftID,
        address _buyer,
        uint256 _purchasePrice,
        uint256 _escrowAmount
    )public payable onlySeller{
        // Transfer from seller address to this escrow contract
        IERC721(nftAddress).transferFrom(seller,address(this),_nftID);
        isListed[_nftID]=true;
        purchasePrice[_nftID]=_purchasePrice;
        buyer[_nftID]= _buyer;
        escrowAmount[_nftID]= _escrowAmount;
        
    }
    function depositEarnest(uint256 _nftID)public payable onlyBuyer(_nftID){
        require(msg.value >= escrowAmount[_nftID]);
    }

    function inspectionStatus(uint256 _nftID ,bool _passed) public onlyInsperctor{
        inspectionPassed[_nftID] = _passed;
    }

    function approveSale(uint256 _nftID) public {
        approval[_nftID][msg.sender]= true;
    }

    function finalizeSale(uint256 _nftID) public {
        require(inspectionPassed[_nftID]);
        require(approval[_nftID][buyer[_nftID]]);
        require(approval[_nftID][seller]);
        require(approval[_nftID][lender]);
        require(address(this).balance >= purchasePrice[_nftID]);

        isListed[_nftID] = false;


       // this is a way of sending ethers from smart contract to the seller
       (bool success,) = payable(seller).call{value: address(this).balance}(
            ""
        );
        require(success);

        IERC721(nftAddress).transferFrom(address(this), buyer[_nftID], _nftID);

    }

    receive() external payable{}

    function getBalance()public view returns(uint256) {
        return address(this).balance;

    }


 
}
