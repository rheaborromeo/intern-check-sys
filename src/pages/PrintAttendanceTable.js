import React from "react";
import ReactDOMServer from "react-dom/server";
import BookPrintView from "./BookPrintView";

const PrintAttendanceTable = () => {
  const handlePrint = () => {
    const printContent = ReactDOMServer.renderToStaticMarkup(<BookPrintView />);

    
    const html = `
      <html>
        <head>
          <title>Print Book</title>
          <style>
            body {
              font-family: 'Times New Roman', serif;
              padding: 40px;
            }
            h1 {
              text-align: center;
            }
            p {
              text-align: justify;
            }
          </style>
        </head>
        <body>
          ${printContent}
          <script>
            window.onload = function() {
              window.print();
              window.close();
            };
          </script>
        </body>
      </html>
    `;

    const printWindow = window.open("", "_blank");
    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
  };
  return (
    <div>
      <h2>Normal Web Page</h2>
      <p>This is the regular view you see on screen.</p>
      <button onClick={handlePrint}>Print Book Style</button>
    </div>
  );
};
export default PrintAttendanceTable;