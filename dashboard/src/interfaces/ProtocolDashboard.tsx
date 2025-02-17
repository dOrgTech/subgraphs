import { CircularProgress } from "@mui/material";
import { ApolloClient, ApolloError, gql, HttpLink, InMemoryCache, useLazyQuery, useQuery } from "@apollo/client";

import { Chart as ChartJS, registerables } from "chart.js";
import React, { useEffect, useMemo, useState } from "react";
import { schema } from "../queries/schema";
import { PoolNames, SubgraphBaseUrl } from "../constants";
import ErrorDisplay from "./ErrorDisplay";
import { useSearchParams } from "react-router-dom";
import { useNavigate } from "react-router";
import { isValidHttpUrl } from "../utils";
import AllDataTabs from "./AllDataTabs";
import { DashboardHeader } from "../graphs/DashboardHeader";

function ProtocolDashboard() {
  const [searchParams] = useSearchParams();
  const subgraphParam = searchParams.get("endpoint");
  const tabString = searchParams.get("tab") || "";
  const poolIdString = searchParams.get("poolId") || "";
  const scrollToView = searchParams.get("view") || "";
  const navigate = useNavigate();

  const [subgraphToQuery, setSubgraphToQuery] = useState({ url: "", version: "" });
  const [poolId, setPoolId] = useState<string>(poolIdString);

  ChartJS.register(...registerables);
  const client = useMemo(() => {
    return new ApolloClient({
      link: new HttpLink({
        uri: subgraphToQuery.url,
      }),
      cache: new InMemoryCache(),
    });
  }, [subgraphToQuery.url]);
  const query = gql`
    {
      protocols {
        type
        schemaVersion
        subgraphVersion
        methodologyVersion
        name
        id
        network
      }
    }
  `;

  // This query is to fetch data about the protocol. This helps select the proper schema to make the full query
  const {
    data: protocolSchemaData,
    loading: protocolSchemaQueryLoading,
    error: protocolSchemaQueryError,
  } = useQuery(query, { client });

  // By default, set the schema version to the user selected. If user has not selected, go to the version on the protocol entity
  let schemaVersion = subgraphToQuery.version;
  if (!schemaVersion && protocolSchemaData?.protocols[0].schemaVersion) {
    schemaVersion = protocolSchemaData?.protocols[0].schemaVersion;
  }

  // The following section fetches the full data from the subgraph. It routes to query selection and then makes the request
  const {
    entitiesData,
    entities,
    poolData,
    query: graphQuery,
    events,
    protocolFields,
  } = schema(protocolSchemaData?.protocols[0].type, schemaVersion);
  const queryMain = gql`
    ${graphQuery}
  `;

  const [getData, { data, loading, error }] = useLazyQuery(queryMain, { variables: { poolId }, client });

  let tabNum = "1";
  if (tabString.toUpperCase() === "POOL" || tabString.toUpperCase() === "MARKET") {
    tabNum = "2";
  } else if (tabString.toUpperCase() === "EVENTS") {
    tabNum = "3";
  }

  const [tabValue, setTabValue] = useState(tabNum);

  // Error logging in case the full data request throws an error
  useEffect(() => {
    console.log("--------------------Error Start-------------------------");
    console.log(error, error ? Object.values(error) : null);
    console.log(protocolSchemaQueryError ? Object.values(protocolSchemaQueryError) : null);
    console.log("--------------------Error End---------------------------");
  }, [error]);

  useEffect(() => {
    // If the schema query request was successful, make the full data query
    if (protocolSchemaData) {
      getData();
    }
  }, [protocolSchemaData, getData]);

  useEffect(() => {
    if (!subgraphToQuery.url && subgraphParam) {
      let queryURL = `${SubgraphBaseUrl}${subgraphParam}`;
      const parseCheck = isValidHttpUrl(subgraphParam);
      if (parseCheck) {
        queryURL = subgraphParam;
      }
      setSubgraphToQuery({ url: queryURL, version: subgraphToQuery.version });
    }
  }, [subgraphToQuery.url, subgraphParam, subgraphToQuery.version]);

  useEffect(() => {
    document.getElementById(scrollToView)?.scrollIntoView();
  });

  const handleTabChange = (event: any, newValue: string) => {
    let tabName = "protocol";
    let poolParam = `&poolId=${poolId}`;
    if (newValue === "1") {
      poolParam = "";
    } else if (newValue === "2") {
      tabName = "pool";
    } else if (newValue === "3") {
      tabName = "events";
    }
    navigate(`?endpoint=${subgraphParam}&tab=${tabName}${poolParam}`);
    setTabValue(newValue);
  };

  // errorRender is the element to be rendered to display the error
  let errorDisplayProps = null;
  // Conditionals for calling the errorDisplay() function for the various types of errors
  // Bottom to top priority an 'protocolSchemaQueryError' will override 'warning'

  if (protocolSchemaQueryError && !loading) {
    // ...includes('has no field') checks if the error is describing a discrepancy between the protocol query and the fields in the protocol entity on the schema
    if (!protocolSchemaData && !protocolSchemaQueryError.message.includes("has no field")) {
      errorDisplayProps = new ApolloError({
        errorMessage: `DEPLOYMENT UNREACHABLE - ${subgraphToQuery.url} is not a valid subgraph endpoint URL. If a subgraph namestring was used, make sure that the namestring points to a hosted service deployment named using the standard naming convention (messari/uniswap-v3-ethereum).`,
      });
    } else {
      errorDisplayProps = protocolSchemaQueryError;
    }
  }
  if (error && !loading) {
    errorDisplayProps = error;
  }

  return (
    <div className="ProtocolDashboard">
      <DashboardHeader
        protocolSchemaData={protocolSchemaData}
        subgraphToQueryURL={subgraphToQuery.url}
        schemaVersion={schemaVersion}
      />
      {(protocolSchemaQueryLoading || loading) && !!subgraphToQuery.url ? (
        <CircularProgress sx={{ margin: 6 }} size={50} />
      ) : null}
      <ErrorDisplay
        errorObject={errorDisplayProps}
        setSubgraphToQuery={(x) => setSubgraphToQuery(x)}
        protocolSchemaData={protocolSchemaData}
        subgraphToQuery={subgraphToQuery}
      />
      {!!data && (
        <AllDataTabs
          data={data}
          entities={entities}
          entitiesData={entitiesData}
          tabValue={tabValue}
          protocolFields={protocolFields}
          poolNames={PoolNames[data.protocols[0].type]}
          poolId={poolId}
          poolData={poolData}
          events={events}
          setPoolId={(x) => setPoolId(x)}
          handleTabChange={(x, y) => handleTabChange(x, y)}
        />
      )}
    </div>
  );
}

export default ProtocolDashboard;
