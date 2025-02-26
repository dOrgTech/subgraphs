import ProtocolInfo from "./ProtocolInfo";
import React from "react";
import { Link as RouterLink } from "react-router-dom";
import { styled } from "../styled";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import { Link } from "@mui/material";

const BackBanner = styled("div")`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(1)};
  padding: ${({ theme }) => theme.spacing(2)};
  background: #38404a;
`;

interface DashboardHeaderProps {
  protocolSchemaData: Record<string, any> | undefined;
  subgraphToQueryURL: string;
  schemaVersion: string;
}

export const DashboardHeader = ({ protocolSchemaData, subgraphToQueryURL, schemaVersion }: DashboardHeaderProps) => {
  return (
    <div>
      <BackBanner>
        <ChevronLeftIcon />
        <Link component={RouterLink} to="/">
          Back to Deployments
        </Link>
      </BackBanner>
      {protocolSchemaData && (
        <ProtocolInfo
          protocolSchemaData={protocolSchemaData}
          subgraphToQueryURL={subgraphToQueryURL}
          schemaVersion={schemaVersion}
        />
      )}
    </div>
  );
};
