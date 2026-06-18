import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import ProductCard from '../../components/ProductCard';
import { products } from '../../lib/products';

const categoryLabels = { apparel: 'Apparel', footwear: 'Footwear', electronics: 'Electronics', all: 'All Products' };

export default function CollectionPage({ category, items }) {
  return (
    <>
      <Navbar />
      <main className="pt-16">
        <div className="bg-gray-50 py-16 text-center">
          <p className="text-xs tracking-widest uppercase text-yellow-600 mb-3">Collection</p>
          <h1 className="font-display text-5xl font-light">{categoryLabels[category] || category}</h1>
          <p className="text-sm text-gray-500 mt-3">{items.length} pieces</p>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {items.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

export async function getStaticPaths() {
  return { paths: ['apparel','footwear','electronics','all'].map(c => ({ params: { category: c } })), fallback: false };
}

export async function getStaticProps({ params }) {
  const { category } = params;
  const items = category === 'all' ? products : products.filter(p => p.category === category);
  return { props: { category, items } };
}
