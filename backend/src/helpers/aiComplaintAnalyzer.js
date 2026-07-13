const { exec } = require("child_process");
const path = require("path");

function analyzeComplaint(complaintText) {
    return new Promise((resolve, reject) => {

        const scriptPath = path.join(
            __dirname,
            "../../../ml/analyze_complaint.py"
        );

        const command = `python "${scriptPath}" "${complaintText.replace(/"/g, '\\"')}"`;

        exec(command, (error, stdout, stderr) => {

            if (error) {
                console.error("AI Error:", error);
                return reject(error);
            }

            if (stderr) {
                console.error(stderr);
            }
            try {
                const result = JSON.parse(stdout.trim());
                resolve(result);
            } catch (err) {
                console.error("JSON Parse Error:", stdout);
                reject(err);
            }
        });
    });
}

module.exports = {
    analyzeComplaint
};