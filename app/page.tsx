import { Suspense } from 'react'
import { PRList } from "../components/pr-list"
import { SearchForm } from "../components/search-form"

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ url?: string }>;
}) {

  const enableForm = process.env.ENABLE_FORM === 'true';

  const { url } = await searchParams;
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-6">
        {enableForm && <SearchForm />}
        <Suspense fallback={<div>Loading...</div>}>
          <PRList searchParams={{ url }} />
        </Suspense>
      </div>
    </div>
  )
}

