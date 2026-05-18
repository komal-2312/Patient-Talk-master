import React, { useState } from "react";
import axios from "axios";

const TrackComplaint = () => {

    const [complaintId, setComplaintId] = useState("");
    const [complaintData, setComplaintData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const trackComplaint = async () => {
        try {
            setLoading(true);
            setError("");

            const res = await axios.get(
                `${import.meta.env.VITE_BACKENDURL}/api/user/trackComplaint/${complaintId}`
            );

            setComplaintData(res.data.data);
        } catch (err) {

            console.error(err);
            setError("Complaint not found");

        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            maxWidth: "600px",
            margin: "50px auto",
            padding: "20px",
            borderRadius: "12px",
            background: "#fff",
            boxShadow: "0 0 10px rgba(0,0,0,0.1)"
        }}>

            <h2>Track Complaint</h2>

            <input
                type="text"
                placeholder="Enter Complaint ID"
                value={complaintId}
                onChange={(e) => setComplaintId(e.target.value)}
                style={{
                    width: "100%",
                    padding: "12px",
                    marginBottom: "15px"
                }}
            />

            <button onClick={trackComplaint}>
                {loading ? "Tracking..." : "Track Complaint"}
            </button>

            {error && (
                <p style={{ color: "red" }}>
                    {error}
                </p>
            )}

            {complaintData && (

                <div style={{ marginTop: "20px" }}>
                    <h3>Complaint Details</h3>
                    <p>
                        <strong>Complaint ID:</strong>
                        {" "}
                        {complaintData.complaintId}
                    </p>

                    <p>
                        <strong>Status:</strong>
                        {" "}
                        {complaintData.status}
                    </p>

                    <p>
                        <strong>Department:</strong>
                        {" "}
                        {complaintData.department}
                    </p>

                    <p>
                        <strong>Priority:</strong>
                        {" "}
                        {complaintData.priority}
                    </p>

                    <p>
                        <strong>Admin Remarks:</strong>
                        {" "}
                        {complaintData.adminRemarks || "No remarks yet"}
                    </p>

                </div>
            )}
        </div>
    );
};

export default TrackComplaint;