// Worldwide countries, editable regions and named time zones; no location service.
(() => {
    const city = document.getElementById('employee-location');
    const country = document.getElementById('employee-country');
    const region = document.getElementById('employee-region');
    const zone = document.getElementById('employee-timeZone');
    if (!city || !country || !region || !zone) return;
    const codes = 'AD AE AF AG AI AL AM AO AQ AR AS AT AU AW AX AZ BA BB BD BE BF BG BH BI BJ BL BM BN BO BQ BR BS BT BV BW BY BZ CA CC CD CF CG CH CI CK CL CM CN CO CR CU CV CW CX CY CZ DE DJ DK DM DO DZ EC EE EG EH ER ES ET FI FJ FK FM FO FR GA GB GD GE GF GG GH GI GL GM GN GP GQ GR GS GT GU GW GY HK HM HN HR HT HU ID IE IL IM IN IO IQ IR IS IT JE JM JO JP KE KG KH KI KM KN KP KR KW KY KZ LA LB LC LI LK LR LS LT LU LV LY MA MC MD ME MF MG MH MK ML MM MN MO MP MQ MR MS MT MU MV MW MX MY MZ NA NC NE NF NG NI NL NO NP NR NU NZ OM PA PE PF PG PH PK PL PM PN PR PS PT PW PY QA RE RO RS RU RW SA SB SC SD SE SG SH SI SJ SK SL SM SN SO SR SS ST SV SX SY SZ TC TD TF TG TH TJ TK TL TM TN TO TR TT TV TW TZ UA UG UM US UY UZ VA VC VE VG VI VN VU WF WS YE YT ZA ZM ZW'.split(' ');
    const names = new Intl.DisplayNames(['en'], { type: 'region' });
    const option = (value, label=value) => { const node=document.createElement('option'); node.value=value; node.textContent=label; return node; };
    country.append(...codes.map(code=>names.of(code)).sort((a,b)=>a.localeCompare(b)).map(name=>option(name)));
    const cities = [
      ['Vancouver','British Columbia','Canada','America/Vancouver'],['Toronto','Ontario','Canada','America/Toronto'],['Montreal','Quebec','Canada','America/Toronto'],['Calgary','Alberta','Canada','America/Edmonton'],['Winnipeg','Manitoba','Canada','America/Winnipeg'],['Halifax','Nova Scotia','Canada','America/Halifax'],['St. John’s','Newfoundland and Labrador','Canada','America/St_Johns'],
      ['Los Angeles','California','United States','America/Los_Angeles'],['San Antonio','Texas','United States','America/Chicago'],['New York','New York','United States','America/New_York'],['Denver','Colorado','United States','America/Denver'],['Phoenix','Arizona','United States','America/Phoenix'],['Seattle','Washington','United States','America/Los_Angeles'],['Chicago','Illinois','United States','America/Chicago'],['Honolulu','Hawaii','United States','Pacific/Honolulu'],
      ['London','England','United Kingdom','Europe/London'],['Paris','Île-de-France','France','Europe/Paris'],['Berlin','Berlin','Germany','Europe/Berlin'],['Madrid','Madrid','Spain','Europe/Madrid'],['Rome','Lazio','Italy','Europe/Rome'],['Amsterdam','North Holland','Netherlands','Europe/Amsterdam'],['Istanbul','Istanbul','Türkiye','Europe/Istanbul'],
      ['Kabul','Kabul','Afghanistan','Asia/Kabul'],['Dubai','Dubai','United Arab Emirates','Asia/Dubai'],['Tehran','Tehran','Iran','Asia/Tehran'],['Delhi','Delhi','India','Asia/Kolkata'],['Mumbai','Maharashtra','India','Asia/Kolkata'],['Karachi','Sindh','Pakistan','Asia/Karachi'],['Dhaka','Dhaka','Bangladesh','Asia/Dhaka'],['Tokyo','Tokyo','Japan','Asia/Tokyo'],['Seoul','Seoul','South Korea','Asia/Seoul'],['Beijing','Beijing','China','Asia/Shanghai'],['Singapore','','Singapore','Asia/Singapore'],['Bangkok','Bangkok','Thailand','Asia/Bangkok'],['Manila','Metro Manila','Philippines','Asia/Manila'],
      ['Sydney','New South Wales','Australia','Australia/Sydney'],['Melbourne','Victoria','Australia','Australia/Melbourne'],['Perth','Western Australia','Australia','Australia/Perth'],['Auckland','Auckland','New Zealand','Pacific/Auckland'],['Mexico City','Mexico City','Mexico','America/Mexico_City'],['São Paulo','São Paulo','Brazil','America/Sao_Paulo'],['Buenos Aires','Buenos Aires','Argentina','America/Argentina/Buenos_Aires'],['Lima','Lima','Peru','America/Lima'],['Cairo','Cairo','Egypt','Africa/Cairo'],['Lagos','Lagos','Nigeria','Africa/Lagos'],['Nairobi','Nairobi','Kenya','Africa/Nairobi'],['Johannesburg','Gauteng','South Africa','Africa/Johannesburg']
    ];
    // Canonical country names follow the same locale data as the country menu.
    const fixCountry = {'Türkiye':names.of('TR'),'South Korea':names.of('KR')};
    cities.forEach(row=>row[2]=fixCountry[row[2]]||row[2]);
    const fallbackZones=['UTC','America/Vancouver','America/Toronto','America/Los_Angeles','America/Chicago','America/Denver','America/Phoenix','America/New_York'];
    const zones = [...new Set([...fallbackZones,...cities.map(row=>row[3]),...(Intl.supportedValuesOf ? Intl.supportedValuesOf('timeZone') : [])])].sort();
    zone.append(...zones.map(value=>option(value,value.replaceAll('_',' '))));
    const regions = {
      Canada:'Alberta|British Columbia|Manitoba|New Brunswick|Newfoundland and Labrador|Northwest Territories|Nova Scotia|Nunavut|Ontario|Prince Edward Island|Quebec|Saskatchewan|Yukon',
      'United States':'Alabama|Alaska|Arizona|Arkansas|California|Colorado|Connecticut|Delaware|District of Columbia|Florida|Georgia|Hawaii|Idaho|Illinois|Indiana|Iowa|Kansas|Kentucky|Louisiana|Maine|Maryland|Massachusetts|Michigan|Minnesota|Mississippi|Missouri|Montana|Nebraska|Nevada|New Hampshire|New Jersey|New Mexico|New York|North Carolina|North Dakota|Ohio|Oklahoma|Oregon|Pennsylvania|Rhode Island|South Carolina|South Dakota|Tennessee|Texas|Utah|Vermont|Virginia|Washington|West Virginia|Wisconsin|Wyoming',
      Australia:'Australian Capital Territory|New South Wales|Northern Territory|Queensland|South Australia|Tasmania|Victoria|Western Australia'
    };
    function suggestions() {
        const choices=cities.filter(row=>!country.value||row[2]===country.value);
        document.getElementById('location-options').replaceChildren(...choices.map(row=>option(row[0],row.slice(0,3).filter(Boolean).join(', '))));
        const items=regions[country.value]?.split('|') || [...new Set(choices.map(row=>row[1]).filter(Boolean))];
        document.getElementById('region-options').replaceChildren(...items.map(value=>option(value)));
    }
    city.addEventListener('change',()=>{
        const matches=cities.filter(row=>row[0].toLowerCase()===city.value.trim().toLowerCase()&&(!country.value||row[2]===country.value));
        if(matches.length===1){const row=matches[0];city.value=row[0];region.value=row[1];country.value=row[2];zone.value=row[3];suggestions();city.dispatchEvent(new Event('input',{bubbles:true}));}
    });
    country.addEventListener('change',()=>{region.value='';zone.value='';suggestions();});
    suggestions();
})();
