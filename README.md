# $VIBE Airdrop Calculator

A modern web application for calculating $VIBE airdrops based on $FUNDED token holdings across multiple wallets on Base mainnet. Built with React, Vite, and Tailwind CSS, powered by the Moralis API.

## Features

- 🪙 Check $FUNDED token balances at block 26,161,082
- 🔍 Query Base blockchain using Moralis API
- 👥 Support for multiple wallet addresses
- 🎯 Calculate combined $VIBE airdrop based on total holdings
- 🎨 Clean, modern UI with responsive design
- ⚡ Fast and efficient token balance retrieval
- 📱 Mobile-friendly interface
- 🔗 Direct integration with Base mainnet

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Moralis API key

## Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up environment variables**
   
   Create a `.env` file in the root directory and add your Moralis API key:
   ```bash
   VITE_MORALIS_API_KEY=your_moralis_api_key_here
   ```
   
   Get your Moralis API key from [Moralis Admin Panel](https://admin.moralis.io/)

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   
   Navigate to `http://localhost:3000`

## Usage

1. **Add Wallet Addresses**: Enter one or more wallet addresses to check
2. **Add More Wallets**: Click "Add Another Wallet" to check multiple addresses
3. **Click "Calculate Total $VIBE Airdrop"**: The app will query Base mainnet for all wallets
4. **View Results**: See individual wallet balances and total estimated airdrop

The app automatically uses:
- **Token**: $FUNDED (0xc1d5892e28ea1c5ecd9fac7771b9d06802f321e0)
- **Block**: 26,161,082
- **Network**: Base Mainnet
- **Rate**: $0.15 per $FUNDED token

## Deployment

### Vercel (Recommended)

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Deploy to Vercel**
   ```bash
   vercel
   ```

3. **Or connect your GitHub repository**:
   - Push your code to GitHub
   - Go to [vercel.com](https://vercel.com)
   - Import your repository
   - Add your environment variables in the Vercel dashboard

### Manual Build

```bash
npm run build
```

The built files will be in the `dist` directory.

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_MORALIS_API_KEY` | Your Moralis API key | Yes |

## Technologies Used

- **Frontend**: React 18, Vite
- **Styling**: Tailwind CSS
- **Blockchain API**: Moralis
- **Icons**: Lucide React
- **Build Tool**: Vite
- **Deployment**: Vercel-ready

## API Configuration

The app is configured to work with Base mainnet (Chain ID: 0x2105). The Moralis API handles:
- Token balance queries at specific blocks
- Token metadata retrieval
- Address validation
- Error handling

## Troubleshooting

- **API Key Issues**: Ensure your Moralis API key is valid and has sufficient credits
- **Network Errors**: Check your internet connection and Moralis service status
- **Invalid Addresses**: Ensure addresses start with `0x` and are valid Ethereum addresses
- **Moralis SDK**: Ensure Moralis is properly initialized before use
- **Deployment Issues**: Check that all environment variables are set in Vercel

## License

MIT License - see LICENSE file for details.

## Support

For issues related to:
- **Moralis API**: Contact [Moralis Support](https://moralis.io/support/)
- **Base Blockchain**: Visit [Base Documentation](https://docs.base.org/)
- **App Issues**: Open an issue in this repository
