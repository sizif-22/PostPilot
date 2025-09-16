import ChannelDashboard from "@/components/DashboardComponents/Dashboard/ChannelDashboard";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function Page({ params }: PageProps) {
  const { id } = await params;
  return <ChannelDashboard id={id} />;
}
