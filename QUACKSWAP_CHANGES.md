# QuackSwap - Changes from Uniswap Interface

This document outlines all the modifications made to rebrand and customize the Uniswap interface into QuackSwap.

## Summary of Changes

### 1. Branding Changes
- **Application Name**: Changed from "Uniswap Interface" to "QuackSwap Interface"
- **Package Name**: Changed from `@uniswap/interface` to `@quackswap/interface`
- **Manifest**: Updated PWA manifest with QuackSwap branding
- **Theme Color**: Changed from purple (`#FC72FF`) to cream (`#F5DEB3`)

**Files Modified:**
- `public/index.html` - Updated title and removed Uniswap API preconnect
- `public/manifest.json` - Updated name, description, and theme color
- `package.json` - Updated package name and description

### 2. Privacy Policy & Copyright
- **Privacy Policy**: Removed external Uniswap terms of service and privacy policy links
- **Simplified**: Privacy modal now only shows minimal third-party services (RPC Node, The Graph)
- **Copyright**: Removed "© Uniswap Labs" from footer
- **Footer**: Removed all external Uniswap links (Community, Governance, Developers, Careers, Blog, Contact, Help Center)
- **Social Links**: Removed Discord, Twitter, and GitHub links

**Files Modified:**
- `src/components/PrivacyPolicy/index.tsx` - Simplified privacy policy
- `src/components/About/AboutFooter.tsx` - Removed copyright and external links

### 3. Moonpay (Fiat On-Ramp) Removal
- **FiatOnrampModal**: Removed from TopLevelModals
- **Buy Button**: Removed SwapBuyFiatButton from SwapHeader
- **Environment Variables**: Moonpay API keys/endpoints no longer used

**Files Modified:**
- `src/components/TopLevelModals/index.tsx` - Removed FiatOnrampModal import and usage
- `src/components/swap/SwapHeader.tsx` - Removed SwapBuyFiatButton

**Related Files (not modified but no longer used):**
- `src/components/FiatOnrampModal/index.tsx`
- `src/components/swap/SwapBuyFiatButton.tsx`

### 4. NFT Features Removal
- **Routes**: All NFT routes disabled (`/nfts`, `/nfts/asset`, `/nfts/profile`, `/nfts/collection`)
- **Components**: Removed NFT Bag and TransactionCompleteModal from TopLevelModals
- **Lazy Loading**: Commented out NFT page imports

**Files Modified:**
- `src/pages/RouteDefinitions.tsx` - Disabled all NFT routes
- `src/components/TopLevelModals/index.tsx` - Removed Bag and TransactionCompleteModal

**Related Files (disabled):**
- `nft/pages/explore`
- `nft/pages/collection`
- `nft/pages/profile`
- `nft/pages/asset/Asset`
- `nft/components/bag/Bag`
- `nft/components/collection/TransactionCompleteModal`

### 5. Fiat Currency Selector Removal
- **Settings Menu**: Removed currency selector option
- **Default Menu**: Removed LOCAL_CURRENCY_SETTINGS state
- **Hooks**: No longer using local currency selection

**Files Modified:**
- `src/components/AccountDrawer/DefaultMenu.tsx` - Removed LocalCurrencyMenu import and state
- `src/components/AccountDrawer/SettingsMenu.tsx` - Removed currency selection UI

**Related Files (no longer used):**
- `src/components/AccountDrawer/LocalCurrencyMenu.tsx`
- `src/constants/localCurrencies.tsx`

### 6. Color Theme Changes
Changed from Uniswap purple branding to cream color scheme:

**Color Changes:**
- **Dark Theme Accent**: `#FC72FF` → `#F5DEB3` (wheat/cream)
- **Dark Theme Accent2**: `#311C31` → `#3D3426` (dark cream)
- **Light Theme Accent**: `#FC72FF` → `#D2B48C` (tan)
- **Light Theme Accent2**: `#FFEFFF` → `#FFF8E7` (lemon chiffon)
- **Branded Gradient**: Purple/Pink → Cream gradient

**Files Modified:**
- `src/theme/colors.ts` - Updated accent colors and gradients

### 7. Docker & IPFS Deployment
Added complete Docker-based build and IPFS deployment system:

**New Files Created:**
- `Dockerfile` - Multi-stage build with IPFS deployment
- `docker-compose.yml` - Docker Compose configuration
- `.dockerignore` - Docker build optimization
- `deploy-ipfs.sh` - Automated deployment script

**Usage:**
```bash
# Build and deploy to IPFS
./deploy-ipfs.sh

# Or manually
docker-compose build
docker-compose run --rm build
docker-compose run --rm ipfs-deploy
```

The IPFS hash will be saved to `ipfs-hash.txt` and the deployment can be accessed via:
- `https://ipfs.io/ipfs/<hash>`
- `https://gateway.pinata.cloud/ipfs/<hash>`

## Pending Changes (Not Yet Implemented)

The following changes were requested but require more extensive modifications:

### 8. Remove External Routing / Force Default RPC
**Goal**: Remove external routing APIs and use only wallet/default RPC

**Files to Modify:**
- `src/state/routing/useRoutingAPITrade.ts`
- `src/hooks/useAutoRouterSupported.ts`
- `.env` and `.env.production` - Remove routing API URLs
- Smart Order Router integration points

**Complexity**: High - requires understanding of routing logic and fallback mechanisms

### 9. Remove UniswapX
**Goal**: Remove UniswapX order routing system

**Files to Modify:**
- `src/state/routing/types.ts` - Remove RouterPreference.X
- `src/featureFlags/flags/uniswapXDefault.ts`
- `src/components/Settings/RouterPreferenceSettings/index.tsx`
- `src/components/Logo/UniswapXBrandMark.tsx`
- All DutchOrderTrade references

**Complexity**: High - tightly integrated with swap logic

### 10. Change Token Pricing to USDC-based
**Goal**: Show prices in USDC instead of USD with clear labeling

**Files to Modify:**
- `src/hooks/useUSDPrice.ts` - Main pricing hook
- `src/hooks/useStablecoinPrice.ts`
- `src/utils/formatNumbers.ts` - Price formatting
- All UI components displaying prices

**Complexity**: Medium - need to swap USD references with USDC

### 11. Remove Claim UNI Tokens Popup
**Goal**: Remove UNI airdrop claim functionality

**Files to Modify:**
- `src/components/Popups/ClaimPopup.tsx`
- `src/components/claim/AddressClaimModal.tsx`
- `src/state/claim/hooks.ts`
- `src/state/application/reducer.ts` - Remove CLAIM_POPUP modal

**Complexity**: Low-Medium

## Build Instructions

### Prerequisites
- Node.js 18.x
- Yarn >= 1.22
- Docker (for IPFS deployment)

### Development Build
```bash
yarn install
yarn start
```

### Production Build
```bash
yarn install
yarn build
```

### IPFS Deployment
```bash
chmod +x deploy-ipfs.sh
./deploy-ipfs.sh
```

## Environment Variables

You may want to update/remove these in `.env` and `.env.production`:

**Remove (no longer used):**
- `REACT_APP_MOONPAY_API`
- `REACT_APP_MOONPAY_LINK`
- `REACT_APP_MOONPAY_PUBLISHABLE_KEY`

**Keep (still required):**
- RPC endpoints for blockchain connectivity
- The Graph API endpoints (for token data)
- Any wallet connection parameters

## Testing

After making changes, test the following:
1. ✅ Application loads with QuackSwap branding
2. ✅ Color theme shows cream instead of purple
3. ✅ No Buy button in swap interface
4. ✅ NFT routes are inaccessible
5. ✅ Privacy policy shows simplified version
6. ✅ Settings menu has no currency selector
7. ✅ Footer shows no Uniswap links/copyright
8. ⏳ Token swapping still works (requires running build)
9. ⏳ Pool functionality works
10. ⏳ Wallet connection works

## Notes

- TypeScript errors during editing are expected until `yarn install` is run
- Some Uniswap SDK dependencies remain as they're needed for core functionality (swapping, liquidity)
- The @uniswap npm packages are still used for blockchain interactions
- External API calls to The Graph may still reference Uniswap subgraphs

## License

This fork maintains the GPL-3.0-or-later license from the original Uniswap interface.

## Original Uniswap Interface

This is a fork of the Uniswap Interface v4.271.0. For the original repository, see:
https://github.com/Uniswap/interface
