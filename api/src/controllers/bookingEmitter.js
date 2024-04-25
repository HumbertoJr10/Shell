const axios = require('axios')
const querystring = require('querystring');
const {parseString} = require('xml2js');
const { URL, HEADERS, TARGET } = require('../../config');


const reserveEmitter = async (bookingID, user, password, AgentSine, TerminalID) => {

    let full = []

    const obj = {
        user: user,
        password: password,
        request: `<KIU_AirDemandTicketV2RQ xmlns:ns="http://www.opentravel.org/OTA/2003/05/common" xmlns:vc="http://www.w3.org/2007/XMLSchema-versioning" xmlns:sch="http://purl.oclc.org/dsdl/schematron" xmlns:fn="http://www.w3.org/2005/xpath-functions" xmlns="http://www.opentravel.org/OTA/2003/05" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.opentravel.org/OTA/2003/05" EchoToken="EXAMPLEDEMANDTICKETV2" TimeStamp="2021-12-27T13:10:00" Target="${TARGET}" Version="3.1" SequenceNmbr="1" PrimaryLangID="en-US"> 
        <POS> 
            <Source AgentSine="${AgentSine}" TerminalID="${TerminalID}" ISOCountry="US" ISOCurrency="USD"> 
                <RequestorID Type="5" /> 
                <BookingChannel Type="1" /> 
            </Source> 
        </POS> 
        <DemandTicketDetail> 
            <BookingReference ID="${bookingID}" /> 
            <PaymentInfo PaymentType="1" PaymentRPH="1" InvoiceCode="ACME"> 
            </PaymentInfo> 
            <FlightReference SegmentRPHNumber="1"/>
        </DemandTicketDetail> 
    </KIU_AirDemandTicketV2RQ>`
    }

    // <ValidatingCarrierInfo Carrier="ES"/> 


    let credentials = querystring.stringify(obj);

    await axios.post(URL, credentials, HEADERS)
    .then(response => {
        parseString(response.data, (err, result)=> {
            full.push(result)
            return result
        })
    })


    return full[0]
}

module.exports = reserveEmitter