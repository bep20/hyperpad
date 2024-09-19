import React, { useState, useMemo, useContext } from "react";
import Table from "antd/es/table";
import Button from "antd/es/button";
import Input from "antd/es/input";
import Upload from "antd/es/upload";
import message from "antd/es/message";
import Space from "antd/es/space";
import Steps from "antd/es/steps";
import Pagination from "antd/es/pagination";
import { v4 as uuidv4 } from "uuid";
import Papa from "papaparse";
import { AppContext } from "../../../context/AppStore";

import { UploadOutlined } from "@ant-design/icons";
import useDevice from "../../../hooks/useDevice";
import { parseUploadedData } from "../utils/parsedata";
import useSolanaMultisender from "../../../hooks/logic/useSolanaMultisender";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import {
  multisendToken,
  getTokenDetails,
  validateSolAddress,
  getCluster,
} from "../utils/multisendToken";

const { Step } = Steps;
const isNextStepVisible = (tokenAddress, data) => {
  if (!tokenAddress) {
    return false;
  }
  if (!(data.length > 0)) {
    return false;
  }
  for (let addressDetails of data) {
    if (
      !(
        addressDetails.target &&
        addressDetails.target != "" &&
        addressDetails.amount > 0
      )
    ) {
      return false;
    }
  }
  return true;
};

export const MultisenderForm = () => {
  const [appStore, dispatchAppStore] = useContext(AppContext);

  const cluster = getCluster(appStore?.currentNetwork);

  const Connection = useConnection();
  const { connection } = Connection;
  const wallet = useWallet();

  const [data, setData] = useState([]);
  const [tokenAddress, setTokenAddress] = useState("");
  const [aggregatedData, setAggregatedData] = useState([]);
  const [totalTokenToTransfer, setTotalTokenToTransfer] = useState(0);
  const [invalidAddress, setInvalidAddress] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  //   for step 1
  const [currentPage, setCurrentPage] = useState(1);
  // for step 2
  const [currentPageStepTwo, setCurrentPageStepTwo] = useState(1);
  const pageSize = 10;

  const editableColumns = [
    {
      title: "Target Address",
      dataIndex: "target",
      key: "target",
      render: (text, record, index) => (
        <Input
          value={text}
          onChange={(e) =>
            handleInputChange(record.key, "target", e.target.value)
          }
        />
      ),
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      render: (text, record, index) => (
        <Input
          value={text}
          onChange={(e) =>
            handleInputChange(record.key, "amount", e.target.value)
          }
        />
      ),
    },
    {
      title: "Action",
      dataIndex: "action",
      key: "action",
      render: (text, record) => (
        <Space size="middle">
          <Button onClick={() => handleRemoveRow(record.key)}>Remove</Button>
        </Space>
      ),
    },
  ];
  const nonEditableColumns = [
    {
      title: "Target Address",
      dataIndex: "target",
      key: "target",
      render: (text) => text,
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      render: (text) => text,
    },
  ];

  const handleAddRow = () => {
    setData([{ key: uuidv4(), target: "", amount: "" }, ...data]);
  };

  const handleRemoveRow = (index) => {
    setData((data) => {
      const updatedData = data.filter((item) => item.key !== index);
      return updatedData;
    });
  };
  const handleTokenAddressChange = (e) => {
    setTokenAddress(e.target.value);
  };

  const handleInputChange = (key, field, value) => {
    setData((data) => {
      const updatedData = data.map((item) => {
        if (item.key === key) {
          return { ...item, [field]: value };
        }
        return item;
      });
      return updatedData;
    });
  };

  const handleUpload = (file) => {
    const isCsv =
      file.type === "text/csv" || file.name.toLowerCase().endsWith(".csv");

    if (!isCsv) {
      message.error("You can only upload CSV files!");
      return Promise.reject();
    }
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        // Parse the content of the file using PapaParse
        Papa.parse(e.target.result, {
          complete: (result) => {
            // Check the parsed data and decide whether to allow the upload
            if (result.errors.length === 0 && result.data.length > 0) {
              // Valid CSV content
              const validatedData = parseUploadedData(result.data);
              if (validatedData) {
                setData(validatedData);
                resolve();
              } else {
                console.log("ressss", result);
                message.error("Invalid CSV fileeeee!");
                reject();
              }
            } else {
              console.log("err", result);
              message.error("Invalid CSV file!");
              reject();
            }
          },
          skipEmptyLines: true,
          header: false, // Set to true if your CSV has a header row
        });
      };

      reader.readAsText(file);
    });
  };

  const processDataFromCSV = (csvData) => {
    // Implement logic to process CSV data and return an array of objects
    // This example assumes CSV data is an array of objects with 'target' and 'amount' keys
    return csvData.map((item, index) => ({
      key: data.length + index,
      target: item.target || "",
      amount: item.amount || "",
    }));
  };

  const steps = [
    {
      title: "Input Data",
      content: (
        <div>
          <Space
            direction="vertical"
            style={{ marginBottom: "16px", textAlign: "right", width: "100%" }}
          >
            <Input
              placeholder="Token Address"
              value={tokenAddress}
              onChange={handleTokenAddressChange}
              style={{ width: "100%", marginBottom: "8px" }}
            />
            <div>
              <Button type="default" onClick={() => setData([])}>
                Clear Table
              </Button>
              <Button type="primary" onClick={handleAddRow}>
                Add Row
              </Button>
            </div>
          </Space>

          <Table
            dataSource={data.slice(
              (currentPage - 1) * pageSize,
              currentPage * pageSize
            )}
            columns={editableColumns}
            pagination={false}
            size="small"
          />
          <Pagination
            current={currentPage}
            pageSize={pageSize}
            total={data.length}
            onChange={(page) => setCurrentPage(page)}
            style={{ marginTop: "16px", textAlign: "center" }}
          />
        </div>
      ),
    },
    {
      title: "Confirm Data",
      content: (
        <div>
          <Space
            direction="vertical"
            style={{ marginBottom: "16px", textAlign: "center", width: "100%" }}
          >
            <h3>
              Token Address : <b>{tokenAddress}</b>
            </h3>
            <h3>
              Total Token Transfering:<b> {totalTokenToTransfer}</b>
            </h3>
          </Space>
          <Table
            dataSource={aggregatedData.slice(
              (currentPageStepTwo - 1) * pageSize,
              currentPageStepTwo * pageSize
            )}
            columns={nonEditableColumns}
            pagination={false}
            size="small"
          />
          <Pagination
            current={currentPage}
            pageSize={pageSize}
            total={aggregatedData.length}
            onChange={(page) => setCurrentPageStepTwo(page)}
            style={{ marginTop: "16px", textAlign: "center" }}
          />
        </div>
      ),
    },
  ];

  const nextStep = () => {
    // compute Aggregate of row, if any duplicate is there. & also calculate total amount of all the tokens to display
    let addressMap = new Map();
    for (let i = 0; i < data.length; i++) {
      if (data[i].target && data[i].amount) {
        if (addressMap.has(data[i].target)) {
          const existingAmount = addressMap.get(data[i].target).amount;
          const newAmount = parseInt(existingAmount) + parseInt(data[i].amount);
          addressMap.set(data[i].target, {
            ...data[i],
            amount: newAmount,
          });
        } else {
          addressMap.set(data[i].target, {
            ...data[i],
            amount: parseInt(data[i].amount),
          });
        }
      }
    }
    const uniqueAggregatedData = [...addressMap.values()];
    const tempTotalTokenToTransfer = uniqueAggregatedData.reduce(
      (acc, item) => {
        return acc + parseInt(item.amount);
      },
      0
    );
    setTotalTokenToTransfer(tempTotalTokenToTransfer);
    setAggregatedData(uniqueAggregatedData);
    setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    setAggregatedData([]);
    setCurrentStep(currentStep - 1);
  };

  const handleTokenDistribute = async () => {
    const tokenToDistribute = tokenAddress;
    const dataToProcess = aggregatedData;
    // validate token address
    if (!validateSolAddress(tokenToDistribute)) {
      message.error(`Token address is not valid ${tokenToDistribute}`);
      return;
    } else {
      const invalidAddress = [];
      for (let i = 0; i < dataToProcess.length; i++) {
        if (!validateSolAddress(dataToProcess[i].target)) {
          invalidAddress.push({ ...dataToProcess[i] });
        } else {
          // here check for amounts also
        }
      }
      if (invalidAddress.length) {
        message.error(`Some of more address are not valid`);
        setInvalidAddress(invalidAddress);
        return;
      }
    }

    // data is validated
    // get token decimals and calculate actual number of token based on number of decimals in token
    const { decimals } = await getTokenDetails(connection, tokenToDistribute);
    const calculatedAmountData = dataToProcess.map((item) => {
      const newAmount = parseInt(item.amount) * 10 ** parseInt(decimals);
      return [item.target, newAmount];
    });
    // send for transaction
    const transactionResult = await multisendToken(
      connection,
      wallet,
      wallet.publicKey,
      tokenToDistribute,
      calculatedAmountData
    );
    message.success(
      <span>
        Transferred successfully
        <a
          target="_blank"
          href={`https://explorer.solana.com/tx/${transactionResult}?cluster=${cluster}`}
        >
          Transaction
        </a>
      </span>,
      10
    );

    setData([]);
    setTokenAddress("");
    setAggregatedData([]);
    setCurrentPage(1);
    setCurrentStep(0);
    setCurrentPageStepTwo(0);
  };

  const { isMobile } = useDevice();

  const nextStepVisible = isNextStepVisible(tokenAddress, data);
  console.log("datais", tokenAddress, data, nextStepVisible);

  return (
    <div>
      {!isMobile && (
        <Steps current={currentStep}>
          {steps.map((step, index) => (
            <Step key={index} title={step.title} />
          ))}
        </Steps>
      )}

      <div style={{ marginTop: "16px" }}>{steps[currentStep].content}</div>

      <div
        style={{
          marginTop: "16px",
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        {currentStep > 0 ? (
          <div>
            <Button onClick={prevStep}>Previous</Button>
          </div>
        ) : (
          <Upload showUploadList={false} beforeUpload={handleUpload}>
            <Button icon={<UploadOutlined />}>Upload CSV</Button>
          </Upload>
        )}
        <div>
          {currentStep < steps.length - 1 && (
            <Button
              type="primary"
              disabled={!nextStepVisible}
              onClick={nextStep}
            >
              Next
            </Button>
          )}
          {currentStep === steps.length - 1 && (
            <>
              {wallet.connected ? (
                <Button type="primary" onClick={handleTokenDistribute}>
                  Distribute Tokens
                </Button>
              ) : (
                <Button type="primary" onClick={wallet.connect}>
                  Connect to Distribute
                </Button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default MultisenderForm;
