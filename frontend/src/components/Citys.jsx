import React from "react";
 
import { useState, useEffect } from "react";
function Citys({citydata}) {
  let [data, setdata] = useState([]);
  let [search, setsearch] = useState("");
  let [filters, setfilter] = useState([]);

  let getdata = async () => {
    let response = await fetch("http://localhost:5000/cities");
    let result = await response.json();
      setdata(result);
      
  };
 
  let cityfilter = (e) => {
    let val = e.target.value;

    setsearch(val);
    setfilter(val?data.filter((city) => city.cityname.toLowerCase().startsWith(val.toLowerCase())):[]);
  };
  console.log(search);
  useEffect(() => {
    getdata();
  }, []);


  let selectHandler=(c) => {
    setsearch(c.cityname);
    citydata(c.cityid)
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
          placeholder="Enter your city"
        />
      </div>

      <div>
        {filters.map((c) => (
          <>
            <ul className="list-unstyled">
              <li className="text-dark" onClick={()=>{selectHandler(c)}}>{c.cityname}</li>
            </ul>
          </>
        ))}
      </div>
    </div>
  );
}

export default Citys;
