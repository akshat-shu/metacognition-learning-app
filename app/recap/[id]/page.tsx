import { RecapView } from "@/components/RecapView";

export default async function RecapPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <RecapView sessionId={id} />;
}
