import React from "react";

const Container = ({ children }: { children: React.ReactNode }) => {
  return <div className=" mx-auto px-[55px]">{children}</div>;
};

export default Container;
