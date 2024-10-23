import React, { useState, useEffect, createContext } from "react";
import { nanoid } from "nanoid";

const RiskContext = createContext();

export function RiskProvider({ children }) {
  const [riskData, setRiskData] = useState([]);
  const [score, setScore] = useState("None");
  const [lastUpdatedDate, setLastUpdatedDate] = useState();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    owner: "",
    control: "",
    probability: "low",
    impact: "low",
    riskLevel: "low",
  });

  /* Local Storage GET */
  useEffect(() => {
    const fetchRiskData = async () => {
		try {
			const response = await fetch("http://localhost:8081/risks");
			const data = await response.json()
			console.log("data risk: ", data);

			setRiskData(data);

			// Set last updated date
			const currentDate = new Date().toISOString();
			setLastUpdatedDate(currentDate);
			window.localStorage.setItem("lastUpdatedDate", JSON.stringify(currentDate));
		} catch (error) {
			console.error("Failed to fetch risks:", error);
		}
	};

	fetchRiskData();
  }, []);

  /* Local Storage SET */
    useEffect(() => {
      window.localStorage.setItem("riskData", JSON.stringify(riskData));
    }, [riskData]);

  // Update Local Storage "Last Updated Date" after changes
    useEffect(() => {
      setLastUpdatedDate();
      window.localStorage.setItem("lastUpdatedDate",JSON.stringify(lastUpdatedDate));
    }, [lastUpdatedDate]);

  // Check when data was last updated (Added/Removed/Modified)
  const updateLastChangedDate = () => {
    const todaysDate = new Date().toLocaleDateString("en-us", {
      month: "numeric",
      day: "numeric",
      year: "numeric",
    });
    setLastUpdatedDate(todaysDate);
  };

  // If a NEW user then set todays date
  if (!lastUpdatedDate) updateLastChangedDate();

  // Get Overall Score | High = 1, Medium = 0.5, low = 0.25
  const getOverallScore = () => {
    if (riskData.length === 0) return setScore("None");

    const lowAmount =
      riskData.filter((item) => item.riskLevel === "low").length * 0.25;
    const MediumAmount =
      riskData.filter((item) => item.riskLevel === "medium").length * 0.5;
    const HighAmount =
      riskData.filter((item) => item.riskLevel === "high").length * 1;

    const totalScore = lowAmount + MediumAmount + HighAmount;
    const totalRisks = riskData.map((item) => item.riskLevel === "high").length;

    if (totalScore >= (80 / 100) * totalRisks) {
      // 80%
      setScore("Very Bad");
    } else if (
      totalScore >= (60 / 100) * totalRisks &&
      totalScore < (80 / 100) * totalRisks
    ) {
      // 60% - 79%
      setScore("Bad");
    } else if (
      totalScore >= totalRisks / 2 &&
      totalScore < (60 / 100) * totalRisks
    ) {
      // 40% - 59%
      setScore("Ok");
    } else {
      // 40% or Less
      setScore("Good");
    }
  };

  // Remove Risk
  const removeRisk = async (e, currentId) => {
    e.preventDefault();
    try {
      await fetch(`http://localhost:8081/risks/${currentId}`, {
        method: "DELETE",
      })
	  .then((response) => response.json())
	  .then((data) => console.log(data))
	  .catch((error) => console.error("Error:", error));

      setRiskData((prevData) =>
        prevData.filter((item) => item.id !== currentId)
      );
      updateLastChangedDate();
    } catch (error) {
      console.error("Failed to remove risk:", error);
    }

    // Update "Last Updated" Date
    updateLastChangedDate();
  };

  /* Update Risk */
  const updateRisk = async (e, currentId) => {
    const { name, value } = e.target;
    try {
      await fetch(`http://localhost:8081/risks/${currentId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...formData, [name]: value }),
      })
	  .then((response) => response.json())
	  .then((data) => console.log(data))
	  .catch((error) => console.error("Error:", error));
   
	  setRiskData((prevData) =>
        prevData.map((item) =>
          item.id === currentId ? { ...item, [name]: value } : item
        )
      );
      updateLastChangedDate();
    } catch (error) {
      console.error("Failed to update risk:", error);
    }
  };

  // Reorder data after Prioritizing
  const reorderDataRisk = (newOrderedArray) => {
    setRiskData(newOrderedArray);
  };

  // Form data for a new risk
  const updateCurrentFormData = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({ ...prevState, [name]: value, id: nanoid() }));
  };

  // Saves new risk to Data
  const addNewRisk = async (e, formData) => {
    e.preventDefault();

    // save new risk in database
    formData.id = nanoid(); // Add unique ID
    try {
      await fetch("http://localhost:8081/risks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })
        .then((response) => response.json())
        .then((data) => console.log(data))
        .catch((error) => console.error("Error:", error));

      // add new risk in state riskData
      setRiskData((prevData) => [...prevData, formData]);
      updateLastChangedDate();
    } catch (error) {
      console.error("Failed to add risk:", error);
    }
  };

  return (
    <RiskContext.Provider
      value={{
        riskData,
        score,
        lastUpdatedDate,
        formData,
        updateLastChangedDate,
        getOverallScore,
        removeRisk,
        updateRisk,
        reorderDataRisk,
        updateCurrentFormData,
        addNewRisk,
      }}
    >
      {children}
    </RiskContext.Provider>
  );
}

export default RiskContext;
