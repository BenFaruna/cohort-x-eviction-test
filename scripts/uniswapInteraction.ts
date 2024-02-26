import { ethers } from "hardhat";
import { parseEther, parseUnits } from "ethers";

const helpers = require("@nomicfoundation/hardhat-toolbox/network-helpers");

const main = async () => {
    const USDCAddress = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
    const DAIAddress = "0x6B175474E89094C44Da98b954EedeAC495271d0F";
    const wethAddress = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";

    const UNIRouter = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";

    const USDCHolder = "0xf584f8728b874a6a5c7a8d4d387c9aae9172d621";

    await helpers.impersonateAccount(USDCHolder);
    const impersonatedSigner = await ethers.getSigner(USDCHolder);

    const USDC = await ethers.getContractAt("IERC20", USDCAddress);
    const DAI = await ethers.getContractAt("IERC20", DAIAddress);
    const WETH = await ethers.getContractAt("IERC20", wethAddress);

    const ROUTER = await ethers.getContractAt("IUniswap", UNIRouter);

    const approveUSDCTx = await USDC.connect(impersonatedSigner).approve(UNIRouter, parseUnits("220", 18));
    approveUSDCTx.wait()

    const approveDAITx = await DAI.connect(impersonatedSigner).approve(UNIRouter, parseUnits("200", 18));
    approveDAITx.wait()

    const ethBal = await impersonatedSigner.provider.getBalance(USDCHolder);
    const userWethBal = await WETH.balanceOf(impersonatedSigner.address);

    const usdcBal = await USDC.balanceOf(impersonatedSigner.address);

    console.log("WETH Balance:", ethers.formatUnits(userWethBal, 18));
    console.log("ETH Balance:",ethers.formatUnits(ethBal, 18));
    console.log("USDC Balance:", ethers.formatUnits(usdcBal, 6))

    console.log("-------------------------------Adding liquidity----------------------------------")

    const liquidityTx = await ROUTER.connect(impersonatedSigner)
        .addLiquidityETH(USDCAddress, parseUnits("20", 6), parseUnits("10", 6),
        parseEther("10"), USDCHolder, (Date.now() + (60*15)),
        {value: parseEther("20")});
    liquidityTx.wait()

    console.log("WETH Balance after adding liquidity:", ethers.formatUnits(await WETH.balanceOf(USDCHolder), 18));
    console.log("ETH Balance after adding liquidity:", ethers.formatUnits(await impersonatedSigner.provider.getBalance(USDCHolder), 18));
    console.log("USDC Balance after adding liquidity:", ethers.formatUnits(await USDC.balanceOf(USDCHolder), 6));


    console.log("-------------------------------Adding liquidity for ERC20-ERC20 pool----------------------------------")

    const addLiquidityERC20Tx = await ROUTER.connect(impersonatedSigner)
        .addLiquidity(USDCAddress, DAIAddress, parseUnits("200", 6), parseUnits("200", 6),
        parseUnits("100", 6), parseUnits("100", 6), USDCHolder, (Date.now() + (60*15)));
    addLiquidityERC20Tx.wait()

    console.log("WETH Balance after removing liquidity:", ethers.formatUnits(await WETH.balanceOf(USDCHolder), 18));
    console.log("ETH Balance after removing liquidity:", ethers.formatUnits(await impersonatedSigner.provider.getBalance(USDCHolder), 18));
    console.log("USDC Balance after removing liquidity:", ethers.formatUnits(await USDC.balanceOf(USDCHolder), 6));
}

main().catch((error) => {
    console.error(error);
    process.exit(1)
})