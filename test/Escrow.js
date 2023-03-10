const { expect } = require('chai');
const { ethers } = require('hardhat');

const tokens = (n) => {
    return ethers.utils.parseUnits(n.toString(), 'ether')
}

describe('Escrow',async() =>{

    let buyer,seller,inspector,lender;
    let escrow,realEstate;

    beforeEach(async()=>{
        //setup accounts
        [buyer,seller,inspector,lender]= await ethers.getSigners();

        //Deploy RealEstate
        let RealEstate = await ethers.getContractFactory('RealEstate');
        realEstate= await RealEstate.deploy();

        //minting
        let transaction = await realEstate.connect(seller).mint('https://gateway.pinata.cloud/ipfs/QmQJc3tWrenPYqqHHWFVTTNxBww3Zagyr2udhPGCYn6mze?filename=1.json')
        await transaction.wait();

        //Deploy escrow
        let Escrow= await ethers.getContractFactory('Escrow');
        escrow= await Escrow.deploy(
            realEstate.address,
            seller.address,
            inspector.address,
            lender.address
        )

        //approve transaction 
        transaction= await realEstate.connect(seller).approve(escrow.address,1);
        await transaction.wait();

        //list 
        transaction = await escrow.connect(seller).list(1,buyer.address,tokens(10),tokens(5))
        await transaction.wait();
        

    })

    describe('Deployment',async()=>{
        it ('returns nft address',async()=>{
            const result = await escrow.nftAddress();
            expect(result).to.be.equal(realEstate.address)
        })
        it('returns seller address',async() =>{
            const result = await escrow.seller();
            expect(result).to.be.equal(seller.address)
        })
        it('returns inspector address',async() =>{
            const result = await escrow.inspector();
            expect(result).to.be.equal(inspector.address)
        })
        it('returns lender address',async() =>{
            const result = await escrow.lender();
            expect(result).to.be.equal(lender.address)
        })


    })

    describe('Listing',async()=>{
        it('Updates Listing',async()=>{
            const result=await escrow.isListed(1);
            expect(result).to.be.equal(true);
        })
        it('Updates buyer',async()=>{
            const result=await escrow.buyer(1);
            expect(result).to.be.equal(buyer.address);
        })
        it('Updates Listing',async()=>{
            const result=await escrow.isListed(1);
            expect(result).to.be.equal(true);
        })
        it('Returns purchase price', async () => {
            const result = await escrow.purchasePrice(1)
            expect(result).to.be.equal(tokens(10))
        })

        it('Returns escrow amount', async () => {
            const result = await escrow.escrowAmount(1)
            expect(result).to.be.equal(tokens(5))
        })
        it('Updates ownership',async()=>{
            expect(await realEstate.ownerOf(1)).to.be.equal(escrow.address)
        })
    })

    describe('deposits',()=>{

        beforeEach(async()=>{
            const transaction = await escrow.connect(buyer).depositEarnest(1,{value: tokens(5)});
            await transaction.wait();
        })

        it('Upadates contract balance',async()=>{
            expect(await escrow.getBalance()).to.be.equal(tokens(5))
        })

    })

    describe('Inspection', () => {
        beforeEach(async () => {
            const transaction = await escrow.connect(inspector).inspectionStatus(1, true)
            await transaction.wait()
        })

        it('Updates inspection status', async () => {
            const result = await escrow.inspectionPassed(1)
            expect(result).to.be.equal(true)
        })
    })
    describe('Approval', () => {
        beforeEach(async () => {
            let transaction = await escrow.connect(buyer).approveSale(1)
            await transaction.wait()

            transaction = await escrow.connect(seller).approveSale(1)
            await transaction.wait()

            transaction = await escrow.connect(lender).approveSale(1)
            await transaction.wait()
        })

        it('Updates approval status', async () => {
            expect(await escrow.approval(1, buyer.address)).to.be.equal(true)
            expect(await escrow.approval(1, seller.address)).to.be.equal(true)
            expect(await escrow.approval(1, lender.address)).to.be.equal(true)
        })
    })

    describe('Sale', () => {
        beforeEach(async () => {
            let transaction1 = await escrow.connect(buyer).depositEarnest(1, { value: tokens(5) })
            await transaction1.wait()
    
            let transaction2 = await escrow.connect(inspector).inspectionStatus(1, true)
            await transaction2.wait()
    
            let transaction3 = await escrow.connect(buyer).approveSale(1)
            await transaction3.wait()
    
            let transaction4 = await escrow.connect(seller).approveSale(1)
            await transaction4.wait()
    
            let transaction5 = await escrow.connect(lender).approveSale(1)
            await transaction5.wait()
    
            await lender.sendTransaction({ to: escrow.address, value: tokens(5) })
    
            let transaction6 = await escrow.connect(seller).finalizeSale(1)
            await transaction6.wait()
        })
    
        it('Updates Ownership',async() =>{
          expect(await realEstate.ownerOf(1)).to.be.equal(buyer.address);
        })
        it('Updates balance', async () => {
          expect(await escrow.getBalance()).to.be.equal(0)
      });
        
    })



})