import React from "react";
import SubmitManuscript from "../../components/forms/SubmitManuscript/SubmitManuscript";
import MinimalHeader from "../../components/layout/Header/MinimalHeader";

const SubmitPage = () => {
  return (
    <>
    <MinimalHeader />
   <main className="w-full min-h-screen px-4 sm:px-6 lg:px-8 pt-4 pb-8 bg-[#f7f9fc]">
      <SubmitManuscript />
    </main>
    </>
  );
};

export default SubmitPage;
