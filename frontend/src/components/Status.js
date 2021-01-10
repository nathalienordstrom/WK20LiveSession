import React, { useState } from "react";
import { useSelector } from "react-redux";

export const Status = () => {
  const statusMessage = useSelector((store) => store.user.login.statusMessage);

  return (
    <section class="status">
      <h2>Status:</h2>
      <h4>Response :</h4>
      <p>{`${statusMessage}`}</p>
    </section>
  );
};
