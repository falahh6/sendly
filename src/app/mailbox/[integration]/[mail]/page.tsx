import { EmailView } from "./_components/emailView";

const Page = ({
  params,
}: {
  params: {
    mail: string;
  };
}) => {
  if (!params.mail) return "null";
  return <EmailView emailTheadId={params.mail} />;
};

export default Page;
