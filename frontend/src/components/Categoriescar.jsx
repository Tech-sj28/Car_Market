  
 import React from "react";
  
 import { useState, useEffect } from "react";
 function Categoriescar({carcategoriesdata}) {
   let [data, setdata] = useState([]);
   let [search, setsearch] = useState("");
   let [filters, setfilter] = useState([]);
 
   let getdata = async () => {
     let response = await fetch("http://localhost:5000/car_categories");
     let result = await response.json();
       setdata(result);
       console.log(result)
   };
  
   let cityfilter = (e) => {
     let val = e.target.value;
 
     setsearch(val);
     setfilter(val?data.filter((city) => city.category_name.toLowerCase().startsWith(val.toLowerCase())):[]);
   };
   console.log(search);
   useEffect(() => {
     getdata();
   }, []);
 
 
   let selectHandler=(c) => {
     setsearch(c.category_name);
     carcategoriesdata(c.category_id)
     setfilter([])
     
   }
   return (
     <div>
       <div class="">
         <input
           type="text"
           value={search}
           onChange={cityfilter}
           class="form-control rinput border"
           placeholder="Enter your category"
         />
       </div>
 
       <div>
         {filters.map((c) => (
           <>
             <ul className="list-unstyled">
               <li className="text-dark" onClick={()=>{selectHandler(c)}}>{c.category_name}</li>
             </ul>
           </>
         ))}
       </div>
     </div>
   );
 }
 
 export default Categoriescar;
 
