import "../App.css"

const Marquee = () => {

   const sponsors = [
  "Ashluxe",
  "Deola Sagoe",
  "Lisa Folawiyo",
  "ATAFO",
  "Zara",
  "Andrea Iyamah",
  "Agbayemaara",
  "Orange Culture",
  "Yomi Casual",
     "Wanni Fuga",
  "WAF (Waffles N Cream)"
  
   ];
   
  return (
      <div className="w-full overflow-hidden bg-[#ec5800] py-4 mt-16 ">
      <div className="marquee flex whitespace-nowrap">
        {[...sponsors, ...sponsors].map((sponsor, index) => (
          <span
            key={index}
            className="mx-12 text-lg font-semibold text-white"
          >
            {sponsor}
          </span>
        ))}
      </div>
    </div>
  );
  
}


export default Marquee



