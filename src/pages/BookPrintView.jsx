import React from "react";

const BookPrintView = () => {
  return (
    <div className="p-10 font-serif">
      <h1 className="text-center text-3xl font-bold">Book Title</h1>
      <p className="text-justify mt-5">
        This is a beautifully formatted page meant for printing in a book-style layout.
        You can add headers, page numbers, chapter titles, etc., here.
      </p>
      <p className="mt-4">
        More content here... Lorem ipsum dolor sit amet, consectetur adipiscing elit.
        Curabitur nec nulla ut nunc suscipit rhoncus. Donec malesuada, turpis ac
        vulputate porttitor, nunc est porttitor sem, nec egestas nulla orci nec magna.
      </p>
    </div>
  );
};

export default BookPrintView;
