const axios = require('axios')
const querystring = require('querystring');
const {parseString} = require('xml2js');
const { URL, HEADERS, TARGET, PASSWORD, getCurrentDate, generateTimeLimit } = require('../../config');
// const { Configuration, Airline } = require('../db')

const createReserve = async (flightConfig, obj, user, password, AgentSine, TerminalID) => {

    const { departureDateTime, arrivalDateTime, resBookDesigCode, flightNumber, departureAirport, arrivalAirport, marketingAirline } = flightConfig
    const full = []

    // console.log(obj);
    let prueba = ''

    const timeNow = getCurrentDate()
    const timeLimit = generateTimeLimit(timeNow, 12)

    for (let f=0; f<obj.length; f++) {

            let request = `<AirTraveler PassengerTypeCode="${obj[f].PTC}">
            <PersonName>
                <GivenName>${obj[f].GiveName.toUpperCase()}</GivenName>
                <Surname>${obj[f].Surname.toUpperCase()}</Surname>
            </PersonName>
            <Document DocType="${obj[f].DocType.toUpperCase()}" DocID="${obj[f].DocID.toUpperCase()}"/>
            <Telephone PhoneNumber="${obj[f].PhoneNumber.at(0) == '+' ? obj[f].PhoneNumber.slice(1) : obj[f].PhoneNumber}"/>
            <Email>${obj[f].Email.toUpperCase()}</Email>
            <TSAInfo>
            <BirthDate>${obj[f].birthDate}</BirthDate>
            <Gender>${obj[f].Gender}</Gender>
            <DocExpireDate>${obj[f].expirationID}</DocExpireDate>
            <DocIssueCountry>${obj[f].DocIssueCountry}</DocIssueCountry>
            <BirthCountry>${obj[f].BirthCountry}</BirthCountry>
            <TSADocType>${obj[f].DocType == "PP" ? "P" : "I"}</TSADocType>
            <TSADocID>${obj[f].DocID.toUpperCase()}</TSADocID>
            </TSAInfo>            
            <TravelerRefNumber RPH="${f+1}"/>
        </AirTraveler>`

        prueba += request
    }

    const parse = {
        user: user,
        password: password,
        request: `<?xml version="1.0" encoding="UTF-8"?> 
        <KIU_AirBookRQ EchoToken="1" TimeStamp="2015-03-30T19:07:51+00:00" Target="${TARGET}" Version="3.0" SequenceNmbr="1" PrimaryLangID="en-us"> 
            <POS> 
                <Source AgentSine="${AgentSine}" TerminalID="${TerminalID}" PseudoCityCode="MIA" ISOCountry="US" ISOCurrency="USD"> 
                    <RequestorID Type="5" /> 
                    <BookingChannel Type="1" /> 
                </Source> 
            </POS> 
            <PriceInfo> 
                <TourCode Type="N" Text="JUANTEST" /> 
            </PriceInfo> 
            <AirItinerary> 
                <OriginDestinationOptions> 
                    <OriginDestinationOption> 
                        <FlightSegment DepartureDateTime="${departureDateTime}" ArrivalDateTime="${arrivalDateTime}" FlightNumber="${flightNumber}" ResBookDesigCode="${resBookDesigCode}"> 
                            <DepartureAirport LocationCode="${departureAirport}" /> 
                            <ArrivalAirport LocationCode="${arrivalAirport}" /> 
                            <MarketingAirline Code="${marketingAirline}" /> 
                        </FlightSegment> 
                    </OriginDestinationOption> 
                </OriginDestinationOptions> 
            </AirItinerary> 
            <TravelerInfo> 
                ${prueba}
                <SpecialReqDetails> 
                    <Remarks> 
                        <Remark>TEST TOURCODE</Remark> 
                    </Remarks> 
                </SpecialReqDetails> 
            </TravelerInfo> 
            <Ticketing TicketTimeLimit="12" /> 
        </KIU_AirBookRQ>`
    };

    

    const credentials = querystring.stringify(parse);

    await axios.post(URL, credentials, HEADERS)
    .then(response => {
        parseString(response.data, (err, result)=> {
            full.push(result)
            
        })
    })

    return full[0]
}

module.exports = createReserve