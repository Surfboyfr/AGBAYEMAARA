import HeroEditorialCard from './HeroEditorialCard'
import BrandCard from './BrandCard'
import StylingCard from './StylingCard'
import MilestoneCard from './MilestoneCard'
import NewBrandCard from './NewBrandCard'
import ProductCard from '../ProductCard'

// Maps a feed item shape to its card component. ProductCard is reused as-is;
// it renders light-theme inside a dark wrapper div here.
const FeedCardRenderer = ({ item }) => {
  switch (item.kind) {
    case 'hero':
      return <HeroEditorialCard card={item} />
    case 'brand':
      return <BrandCard card={item} />
    case 'styling':
    case 'drop':
      return <StylingCard card={item} />
    case 'milestone':
      return <MilestoneCard card={item} />
    case 'newBrand':
      return <NewBrandCard card={item} />
    case 'product':
      return (
        <div className="rounded-2xl bg-white p-1">
          <ProductCard product={item} />
        </div>
      )
    default:
      return null
  }
}

export default FeedCardRenderer
