const axios = require('axios')
const querystring = require('querystring');
const {parseString} = require('xml2js');
const { URL, HEADERS, TARGET, getAirline, PASSWORD } = require('../../config')
const { Configuration, Airline } = require('../db')

const iata = ["CCS", "MAR", "VLN", "PMV", "VIG", "BLA", "LSP", "MGN", "CUP", "CBL", "PZO", "AAO", "SFD", "EOR", "LRV", "VCR", "SJL", "VDP", "GUQ", "SCI", "EOZ", "SOM", "MRD", "STD", "ANZ"]


const getPrice = async (origin, destination, flightNumber, departureDateTime, arrivalDateTime, marketingAirline, resBookDesigCode, quantity, tickets, travalerInfo, user, password, AgentSine, TerminalID, airlinePrice) => {
   
   // const airlinePrice = await Airline.findAll()
   const airlineData = airlinePrice.find( e => e.code == marketingAirline)

   // SERVICIOSBERKANA
   const obj = {
        user: user,
        password: password,
        request: `<?xml version="1.0" encoding="UTF-8"?>
        <KIU_AirPriceRQ EchoToken="WS3DOCEXAMPLE" TimeStamp="2015-03-09T16:49:52+00:00" Target="${TARGET}" Version="3.0" SequenceNmbr="1" PrimaryLangID="en-us">
           <POS>
              <Source AgentSine="${AgentSine}" TerminalID="${TerminalID}" ISOCountry="US"  ISOCurrency="USD">
                    <RequestorID Type="5" />
                    <BookingChannel Type="1" />
                </Source>
            </POS>
           <AirItinerary>
              <OriginDestinationOptions>
                 <OriginDestinationOption>
                    <FlightSegment DepartureDateTime="${departureDateTime}" ArrivalDateTime="${arrivalDateTime}" FlightNumber="${flightNumber}" ResBookDesigCode="${resBookDesigCode}">
                       <DepartureAirport LocationCode="${origin}" />
                       <ArrivalAirport LocationCode="${destination}" />
                       <MarketingAirline Code="${marketingAirline}" />
                    </FlightSegment>
                 </OriginDestinationOption>
              </OriginDestinationOptions>
           </AirItinerary>
           <TravelerInfoSummary>
           <PriceRequestInformation>
              <TPA_Extension>
                 <TourCode Type="N" Code="JUANTEST" />
              </TPA_Extension>
           </PriceRequestInformation>
              <AirTravelerAvail>
                 ${travalerInfo}
              </AirTravelerAvail>
           </TravelerInfoSummary>
        </KIU_AirPriceRQ>`,
   };
      const full = []

      
      
      const credentials = querystring.stringify(obj);

      await axios.post(URL, credentials, HEADERS)
         .then(response => {
            parseString(response.data, (err, result)=> {
               full.push(result)
            })
      })
         
      // console.log(full[0])
      // return full[0]

      if (full[0] && full[0]["Root"] && full[0]["Root"]["Error"]) {
         return {
            ErrorCode: 10005,
            ErrorMsg: "Invalid Credentials.",
            totalAmount: {
               Amount: "None"
            }
         }
      }

      if (full[0] && full[0]["KIU_AirPriceRS"] &&  full[0]["KIU_AirPriceRS"]["Error"]) {
         return {
            ...full[0]["KIU_AirPriceRS"]["Error"][0],
            totalAmount: {
               Amount: "None"
            }
         }
      }

      
      //  return full[0]
      
      // const config = await Configuration.findAll()
      
      const { nationalTax, internationalTax } = airlineData

      const response = {     
         bookingClass: full[0]["KIU_AirPriceRS"]["PricedItineraries"][0]["PricedItinerary"][0]["AirItinerary"][0]["OriginDestinationOptions"][0]["OriginDestinationOption"][0]["FlightSegment"][0]["$"]["ResBookDesigCode"],
         quantity: tickets,
         base: Math.ceil(full[0]["KIU_AirPriceRS"]["PricedItineraries"][0]["PricedItinerary"][0]["AirItineraryPricingInfo"][0]["ItinTotalFare"][0]["BaseFare"][0]["$"]["Amount"]),
         tax: Math.ceil(full[0]["KIU_AirPriceRS"]["PricedItineraries"][0]["PricedItinerary"][0]["AirItineraryPricingInfo"][0]["ItinTotalFare"][0]["Taxes"][0]["Tax"].map( e => {
            return e["$"]["Amount"]
         }).reduce((acc, num)=> {
            return (num*1) + acc
         }, 0 ) * 1).toString(),
         totalFare: Math.ceil(full[0]["KIU_AirPriceRS"]["PricedItineraries"][0]["PricedItinerary"][0]["AirItineraryPricingInfo"][0]["ItinTotalFare"][0]["BaseFare"][0]["$"]["Amount"]) + Math.ceil(full[0]["KIU_AirPriceRS"]["PricedItineraries"][0]["PricedItinerary"][0]["AirItineraryPricingInfo"][0]["ItinTotalFare"][0]["Taxes"][0]["Tax"].map( e => {
            return e["$"]["Amount"]
         }).reduce((acc, num)=> {
            return (num*1) + acc
         }, 0 ) * 1) + (iata.includes(origin) && iata.includes( destination) ? (nationalTax*1) : (internationalTax * 1)), 
         comission: iata.includes(origin) && iata.includes( destination) ? nationalTax : internationalTax       
      }
   


    return response
}

module.exports = getPrice