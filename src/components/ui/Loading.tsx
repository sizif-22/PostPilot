import React from "react";
import styled from "@emotion/styled";

const Loading = () => {
  return (
    <div className="flex justify-center items-center h-screen dark:bg-black light:bg-gradient-to-b from-violet-100 via-violet-50 to-white">
    <StyledWrapper>
      <div className="loader" />
    </StyledWrapper>
    </div>
  );
};

const StyledWrapper = styled.div`
  .loader {
    width: 45px;
    height: 40px;
    background: linear-gradient(
        #0000 calc(1 * 100% / 6),
        #888 0 calc(3 * 100% / 6),
        #0000 0
      ),
      linear-gradient(
        #0000 calc(2 * 100% / 6),
        #888 0 calc(4 * 100% / 6),
        #0000 0
      ),
      linear-gradient(
        #0000 calc(3 * 100% / 6),
        #888 0 calc(5 * 100% / 6),
        #0000 0
      );
    background-size: 10px 400%;
    background-repeat: no-repeat;
    animation: matrix 1s infinite linear;
  }

  @keyframes matrix {
    0% {
      background-position: 0% 100%, 50% 100%, 100% 100%;
    }

    100% {
      background-position: 0% 0%, 50% 0%, 100% 0%;
    }
  }
`;

export default Loading;
