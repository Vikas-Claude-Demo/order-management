import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { getProducts } from "@/actions/products"
import { ProductsClient } from "./products-client"

export default async function ProductsPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const products = await getProducts()

  return <ProductsClient products={products} />
}
