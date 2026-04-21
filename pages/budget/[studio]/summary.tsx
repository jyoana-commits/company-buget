/**
 * Redirects to the studio page (summary view). Kept for backwards compatibility.
 */
import type { GetServerSideProps } from "next";

export const getServerSideProps: GetServerSideProps = async ({
  req,
  params,
}) => {
  const studio = (params?.studio as string) ?? "";
  return {
    redirect: {
      destination: `/budget/${studio}?view=summary`,
      permanent: false,
    },
  };
};

export default function SummaryRedirect() {
  return null;
}
