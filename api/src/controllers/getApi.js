const axios = require('axios')
const querystring = require('querystring');
const {parseString} = require('xml2js');
const { URL, HEADERS, getAirline, TARGET, PASSWORD } = require('../../config');
const getPrice = require('./getPrice');

const getApi = async (date, origin, destination, returndate, flightConfig, user, password, AgentSine, TerminalID, airlinePrice) => {
    try {
        const full = []

        const { ADT, CNN, INF, maxStop, bookingClass } = flightConfig

        let counter = 0
        let travalerInfo = ''

        if (ADT*1) {
            counter++
            travalerInfo += `   <PassengerTypeQuantity Code="ADT" Quantity="${ADT}" />
            `
        }
        if (CNN*1) {
            counter++
            travalerInfo += `<PassengerTypeQuantity Code="CNN" Quantity="${CNN}" />
            `
        }
        if (INF*1) {
            counter++
            travalerInfo += `<PassengerTypeQuantity Code="INF" Quantity="${INF}" />
            `
        }    
                
        const obj = {
            user: user,
            password: password,
            request: `<?xml version="1.0" encoding="UTF-8"?>
            <KIU_AirAvailRQ EchoToken="1" TimeStamp="2023-06-13T19:20:43+00:00" Target="${TARGET}" Version="3.0" SequenceNmbr="1" PrimaryLangID="en-us" DirectFlightsOnly="false" MaxResponses="10" CombinedItineraries="false">
               <POS>
                  <Source AgentSine="${AgentSine}" TerminalID="${TerminalID}" ISOCountry="US" />
               </POS>
               <OriginDestinationInformation>
                  <DepartureDateTime>${date}</DepartureDateTime>
                  <OriginLocation LocationCode="${origin}" />
                  <DestinationLocation LocationCode="${destination}" />
               </OriginDestinationInformation>
            <TravelPreferences MaxStopsQuantity="">
                  <CabinPref Cabin="" />
               </TravelPreferences>
               <TravelerInfoSummary>
                  <AirTravelerAvail>
                     ${travalerInfo}
                  </AirTravelerAvail>
               </TravelerInfoSummary>
            </KIU_AirAvailRQ>`,
        };

        const objRoundTrip = {
            user: `${user}`,
            password: `${password}`,
            request: `<?xml version="1.0" encoding="UTF-8"?> 
            <KIU_AirAvailRQ EchoToken="1" TimeStamp="2013-01-24T19:20:43+00:00" Target="${TARGET}" Version="3.0" SequenceNmbr="1" PrimaryLangID="en-us" DirectFlightsOnly="false" MaxResponses="10" CombinedItineraries="false"> 
                <POS> 
                    <Source AgentSine="${AgentSine}" TerminalID="${TerminalID}" ISOCountry="US" /> 
                </POS> 
                <OriginDestinationInformation> 
                    <DepartureDateTime>${date}</DepartureDateTime> 
                    <OriginLocation LocationCode="${origin}" /> 
                    <DestinationLocation LocationCode="${destination}" /> 
                </OriginDestinationInformation>
                <OriginDestinationInformation> 
                    <DepartureDateTime>${returndate}</DepartureDateTime> 
                    <OriginLocation LocationCode="${destination}" /> 
                    <DestinationLocation LocationCode="${origin}" /> 
                </OriginDestinationInformation>
                <TravelPreferences MaxStopsQuantity=""> 
                    <CabinPref Cabin="" /> 
                </TravelPreferences> 
                <TravelerInfoSummary> 
                    <AirTravelerAvail> 
                        ${travalerInfo}
                    </AirTravelerAvail> 
                </TravelerInfoSummary> 
            </KIU_AirAvailRQ>`
        }
        

        let credentials

        if (returndate != undefined) {
            credentials = querystring.stringify(objRoundTrip);
            console.log('round trip');
        } else {
            credentials = querystring.stringify(obj);
            console.log('one way')
        }


        await axios.post(URL, credentials, HEADERS)
        .then(response => {
            parseString(response.data, (err, result)=> {
                full.push(result)
                return result
            })
        })
        
        // return full[0]
        // return full[0]

        // console.log(full[0])

        if (full[0] && full[0]["KIU_AirAvailRS"] && full[0]["KIU_AirAvailRS"]["Error"]) {
            return full[0]["KIU_AirAvailRS"]["Error"][0]["ErrorMsg"][0]
        }

        if (full[0] && full[0]["Root"] && full[0]["Root"]["Error"]) {
            return full[0]["Root"] && full[0]["Root"]["Error"]
        }
        

        const allFlights = await Promise.all(full[0]["KIU_AirAvailRS"]["OriginDestinationInformation"].map( async (flight, index) => {
            return  {
                origin: flight["OriginLocation"],
                destination: flight["DestinationLocation"],
                date: flight["DepartureDateTime"],
                flights: typeof flight["OriginDestinationOptions"][0] == 'string' ? [] : await Promise.all( flight["OriginDestinationOptions"][0]["OriginDestinationOption"]?.map( async e => {
                    return await Promise.all( e["FlightSegment"]?.map( async flight => {
                        return {                           
                            departureDateTime: flight["$"]["DepartureDateTime"],
                            arrivalDateTime: flight["$"]["ArrivalDateTime"],
                            flightNumber: flight["$"]["FlightNumber"],
                            duration: flight["$"]["JourneyDuration"],
                            stopQuantity: flight["$"]["StopQuantity"],
                            requiresTSAInfo: flight["$"]["RequiresTSAInfo"],
                            departureAirport: flight["DepartureAirport"][0]["$"]["LocationCode"],
                            arrivalAirport: flight["ArrivalAirport"][0]["$"]["LocationCode"],
                            airEquipType: flight["Equipment"][0]["$"]["AirEquipType"],
                            marketingAirline: flight["MarketingAirline"][0]["$"]["CompanyShortName"],
                            mealCode: flight["Meal"][0]["$"]["MealCode"],
                            marketingCabin: flight["MarketingCabin"][0]["$"],
                            bookingClassAvail: flight["BookingClassAvail"]?.map( bookingClass => {
                                return bookingClass["$"]["ResBookDesigCode"] + bookingClass["$"]["ResBookDesigQuantity"]  
                            })
                        }
                    }) )
                }) )
            }
        }))

        // return allFlights
        
        // LIMITAMOS LAS CLASES
        for (let f=0; f<allFlights.length; f++) {
            for (let i=0; i<allFlights[f].flights.length; i++) {
                for (let u=0; u<allFlights[f].flights[i].length; u++) {
                    // console.log(allFlights[f].flights[i][u])
                    allFlights[f].flights[i][u]["bookingClassAvail"] = allFlights[f].flights[i][u]["bookingClassAvail"].filter( (e)=> {
                        // RUTACA
                        if (allFlights[f].flights[i][u]["marketingAirline"]=="5R" && (e[0]=="U" || e[0]=="X" || e[0]=="B" || e[0]=="Y")) {
                            return e
                        }

                        // if (allFlights[f].flights[i][u]["marketingAirline"]=="QL" && (e[0]=="T" || e[0]=="Q" )) {
                        //     return e
                        // }

                        // if (allFlights[f].flights[i][u]["marketingAirline"]=="9V" && (e[0]=="M" || e[0]=="H")) {
                        //     return e
                        // }

                        // VENEZOLANA
                        if (allFlights[f].flights[i][u]["marketingAirline"]=="WW" && (e[0]=="W" || e[0]=="R" )) {
                            return e
                        }

                        // CONVIASA
                        if (allFlights[f].flights[i][u]["marketingAirline"]=="V0") {
                            return e
                        }

                        // if (allFlights[f].flights[i][u]["marketingAirline"]=="ES" && (e[0]=="Q" || e[0]=="G")) {
                        //     return e
                        // }
                    })
                }
            }
        }
        // return allFlights

        // RESOLVEMOS LAS PROMESAS DE LOS PRECIOS
        for (let f=0; f<allFlights.length; f++) {
            for (let i=0; i<allFlights[f].flights.length; i++) {
                for (let u=0; u<allFlights[f].flights[i].length; u++) {

                    let dati = allFlights[f].flights[i][u]
                    
                    dati.bookingClassAvail = await Promise.all([...dati.bookingClassAvail].map( async e=> {
                        return getPrice(dati.departureAirport, dati.arrivalAirport, dati.flightNumber, dati.departureDateTime, dati.arrivalDateTime, dati.marketingAirline, e[0], "1", e[1], travalerInfo, user, password, AgentSine, TerminalID, airlinePrice)
                    }))

                }
            }
        }

      
        // ORDENAMOS DE MENOR A MAYOR
        for (let f=0; f<allFlights.length; f++) {
            for (let i=0; i<allFlights[f].flights.length; i++) {
                for (let u=0; u<allFlights[f].flights[i].length; u++) {

                    let dati = allFlights[f].flights[i][u]
                    
                    dati.bookingClassAvail = [...dati.bookingClassAvail].sort((a, b)=> a.totalFare - b.totalFare).slice(0, 2)

                }
            }
        }
        // console.log(allFlights.flights)

        return allFlights

    } catch (error) {
        return error.message
    };
};

module.exports = getApi