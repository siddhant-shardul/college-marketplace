import Image from "next/image";
import products from "@/data/products.json";
import type { Product } from "@/types/product";

export default function HomePage() {
  const items = products as Product[];

  return (
    <main className="min-h-screen bg-slate-100">
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Marketplace Demo
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Buy and sell common student products
          </h1>
          <p className="mt-3 max-w-2xl text-base text-slate-600">
            Demo listings with clean local placeholder images. These are not random stock photos.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {items.map((product) => (
            <article
              key={product.id}
              className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-slate-200 transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="relative h-64 w-full bg-slate-200">
                <Image
                  src={product.image}
                  alt={product.title}
                  fill
                  className="object-cover"
                  priority={product.id === "prod_001"}
                />
              </div>

              <div className="p-5">
                <div className="mb-2 flex items-center justify-between gap-3">
                  <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                    {product.category}
                  </span>
                  <span className="text-xl font-bold text-slate-900">
                    ₹{product.price}
                  </span>
                </div>

                <h2 className="text-lg font-semibold text-slate-900">
                  {product.title}
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {product.description}
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
