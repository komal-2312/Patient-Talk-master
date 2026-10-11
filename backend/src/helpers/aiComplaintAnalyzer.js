const { execFile } = require("child_process");
const path = require("path");

function analyzeComplaint(complaintText) {
return new Promise((resolve, reject) => {
const mlDirectory = path.resolve(__dirname, "../../ml");
const scriptPath = path.join(mlDirectory, "analyze_complaint.py");

    execFile(
        "python",
        [scriptPath, complaintText],
        { cwd: mlDirectory },
        (error, stdout, stderr) => {
            if (error) {
                console.error("AI Error:", error.message);
                if (stderr) console.error(stderr);
                return reject(error);
            }

            try {
                resolve(JSON.parse(stdout.trim()));
            } catch (err) {
                console.error("AI JSON Parse Error:", stdout);
                reject(err);
            }
        }
    );
});

}

module.exports = { analyzeComplaint };