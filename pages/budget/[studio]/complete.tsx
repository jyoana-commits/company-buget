/**
 * Redirects to the studio page (complete view). Kept for backwards compatibility.
 */
import type { GetServerSideProps } from "next";

export const getServerSideProps: GetServerSideProps = async ({
  req,
  params,
}) => {
  const studio = (params?.studio as string) ?? "";
  return {
    redirect: {
      destination: `/budget/${studio}`,
      permanent: false,
    },
  };
};

export default function CompleteRedirect() {
  return null;
}
