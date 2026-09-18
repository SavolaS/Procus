# Procus — tuoteidea ja suunnittelun lähtökohdat

Päivitetty: 19.9.2026  
Tila: konsepti ennen tuotesuunnittelua ja toteutusta.

Tämä muistiinpano jäsentää perustajan kuvaaman idean. Markkinaa, datan saatavuutta tai säästöpotentiaalia ei ole vielä validoitu. Ehdotukset ensimmäisen version rajauksesta ovat keskustelun pohjaksi, eivät päätettyjä vaatimuksia.

## 1. Idea lyhyesti

**Procus auttaa hankintatiimejä tunnistamaan nykyisestä toimittajakannasta säästömahdollisuuksia ja muuttamaan ne perustelluiksi neuvottelu- ja kilpailutustoimenpiteiksi.**

Ajatus lähti kuvauksesta ”Realm for buy side”: ostajan puolelle rakennettu työkalu, joka helpottaa tarjouspyyntöjä (RFQ, request for quotation) ja erityisesti nykyisten toimittajien ja ostoehtojen jatkuvaa arviointia. Realm-vertaus on alkuperäinen inspiraatio; sen tarkka merkitys tuotteelle on vielä täsmennettävä.

Idea syntyi keskustelussa Bainin konsultin kanssa ja sitä jalostettiin yhdessä pitkään. Tämä ei tarkoita Bainin virallista hanketta tai organisaation vahvistamaa markkinanäkemystä.

## 2. Ongelma ja kohderyhmä

Lähtöhypoteesi on, että hankintatiimien aika keskittyy suuriin ja strategisiin hankintoihin. Pitkään häntään jää paljon pienempiä sopimuksia ja nimikkeitä, joiden järjestelmälliseen tarkasteluun ei riitä resursseja. Esimerkkinä kohteesta ovat alle 100 000 euron sopimukset; vielä on määriteltävä, tarkoittaako raja sopimuksen kokonaisarvoa vai vuosittaista ostovolyymia.

Ensisijaisesti kiinnostavat vähän jalostetut tuotteet ja hankintakategoriat. Alkuperäisessä kuvauksessa mainittiin myös eri tuotteiden määrä, mutta ajatus jäi kesken: tavoitellaanko erityisesti suuria nimikemääriä vai jotain muuta tuotemäärään liittyvää ominaisuutta?

Tarkka toimiala, asiakasyrityksen koko ja ensimmäinen hankintakategoria ovat avoimia.

Nykytilaa koskevat hypoteesit:

- Hankintoja seurataan usein reaktiivisesti toteutuneiden ostojen eli spendin kautta.
- Sopimuksia ja toimittajia arvioidaan esimerkiksi kvartaaleittain, jolloin muutoksiin reagoidaan viiveellä.
- Pieni yksittäinen säästömahdollisuus ei perustele suurta käsityömäärää, vaikka vastaavien kohteiden yhteenlaskettu arvo voisi olla merkittävä.

Procusin tavoite on tehdä tämän pitkän hännän seurannasta riittävän kevyttä ja toistuvaa, jotta myös pieniin kohteisiin kannattaa tarttua.

## 3. Tuotteen ydin: havainnosta toimenpiteeksi

Procus seuraisi ostohintoja, sopimuksia ja hintaan vaikuttavia tekijöitä nykyistä useammin. Kun se tunnistaa perustellun poikkeaman, se nostaa kohteen hankintatiimin käsiteltäväksi ja ehdottaa seuraavaa toimenpidettä.

Alkuvaiheen painopiste on **nykyisissä toimittajissa ja dual- tai multisourcingissa**: samaa tuotetta tai hankintatarvetta palvelee kaksi tai useampia toimittajia. Avoin kysymys on, ovatko vaihtoehdot jo hyväksyttyjä juuri kyseiselle nimikkeelle vai pelkästään mukana yrityksen toimittajakannassa.

Suunniteltu työnkulku:

1. **Seuraa:** kokoa nimike-, toimittaja-, hinta- ja sopimustiedot sekä saatavilla olevat vertailutekijät.
2. **Tunnista:** nosta esiin hinnannousut ja kohteet, joiden hinta vaikuttaa korkealta suhteessa vertailukelpoiseen vaihtoehtoon tai arvioituun kustannuskehitykseen.
3. **Perustele:** näytä, mihin havainto perustuu, kuinka suuri mahdollisuus on ja mitä tiedosta puuttuu.
4. **Ehdota neuvottelusuunnitelmaa:** anna avauspyyntö, hyväksyttävän lopputuloksen raja ja niitä tukevat argumentit.
5. **Arvioi vaihtoehto:** ehdota ostojen siirtoa toiselle nykyiselle toimittajalle, jos se on toteuttamiskelpoinen vaihtoehto.
6. **Laajenna tarvittaessa:** etsi uusia toimittajaehdokkaita agenttien tekemällä verkkohaulla ja valmistele tarjouspyynnön runko.

Missä vaiheessa työnkulku käynnistyy automaattisesti ja missä tarvitaan ostajan päätös, määritellään myöhemmin.

## 4. Neuvottelusuunnitelma

Ohjelmisto ei vain ilmoita korkeasta hinnasta, vaan ehdottaa käytännön etenemistä.

Alkuperäinen esimerkki:

- **Avauspyyntö (opening ask):** 15 % hinnanalennus.
- **Pienin hyväksyttävä hinnanalennus (least acceptable agreement):** 5 %.
- **Vaihtoehto:** jos riittävää lopputulosta ei saavuteta, arvioidaan toista toimittajaa ja tarvittaessa käynnistetään tarjouspyyntö.

Prosentit ovat havainnollistavia, eivät yleisiä suosituksia tai tuotteen oletusasetuksia. Suunnittelussa on ratkaistava, millä tiedolla järjestelmä voi ehdottaa neuvottelutavoitetta ja milloin se näyttää vain havainnon ostajan arvioitavaksi.

Ehdotus suunnitelman sisällöksi:

- Nykyinen hinta, vertailukohta ja havaittu ero.
- Säästöarvio euroina ja prosentteina sekä laskennan aikajänne.
- Avauspyyntö ja hyväksyttävän lopputuloksen raja perusteluineen.
- Todellinen vaihtoehtoinen toimittaja tai muu etenemistapa.
- Vaihtamisen kustannukset, toimituskyky ja sopimuksen rajoitteet siltä osin kuin ne tunnetaan.
- Lähteet, tiedon ajantasaisuus ja arvion epävarmuus.

## 5. Ennakoiva kustannus- ja hintatarkastelu

Procusin pidemmän aikavälin tavoite on auttaa arvioimaan tulevien hankintojen hintatasoa pelkän toteutuneen spendin raportoinnin lisäksi.

Sopimusten, tuoterakenteen eli BOMin (bill of materials) ja raaka-aineiden hintakehityksen avulla voitaisiin tarkastella, onko ostettavan osan hinnanmuutos perusteltu. Raaka-aineindeksejä ja muita kustannustekijöitä verrattaisiin toimittajan veloittamaan hintaan.

Mahdollisia tietoja ja vertailutekijöitä:

| Tieto | Mahdollinen käyttötarkoitus |
| --- | --- |
| Ostohintojen historia ja ostomäärät | Hinnannousujen ja euromääräisen vaikutuksen tunnistaminen |
| Sopimukset ja hinnastot | Voimassa olevat ehdot, hinnantarkistukset ja neuvotteluajankohdat |
| Saman nimikkeen hinnat eri toimittajilla | Sisäinen hintavertailu |
| BOM ja materiaalisisältö, jos saatavilla | Arvio kustannusrakenteesta ja raaka-ainealtistuksesta |
| Raaka-aineindeksit | Kustannuskehityksen suunta ja vertailu ostohinnan muutokseen |
| Muut kustannustekijät, myöhemmin valittavat | Esimerkiksi valuutta-, energia-, työ- tai logistiikkakustannusten huomiointi |
| Tuleva kysyntä tai hankintasuunnitelma, jos saatavilla | Tulevien ostojen säästöpotentiaalin arviointi |

**Suunnitteluperiaate-ehdotus:** erotetaan toisistaan havaittu ostohinta, vertailuhinta ja mallin arvio perustellusta hintatasosta. Raaka-aineindeksin muutos ei yksin määritä valmiin osan oikeaa hintaa. Vertailussa on huomioitava muun muassa materiaalin osuus kustannuksista, ajallinen viive sekä erot määrissä, laadussa ja toimitusehdoissa.

Tulevien ostojen euromääräinen arvio tarvitsee oletuksen tulevasta ostovolyymista. Jos käytössä on vain historiallinen volyymi, se tulee esittää laskentaoletuksena.

## 6. Neuvotteluaseman arviointi

Yksi kiinnostava lisäulottuvuus on asiakkaan merkitys toimittajalle:

**Ostajan osuus toimittajan liikevaihdosta = ostot toimittajalta / toimittajan liikevaihto samalla ajanjaksolla.**

Alkuperäisessä ideassa esimerkiksi 25 %:n osuutta pidettiin mahdollisena merkkinä merkittävästä neuvotteluvoimasta. Ajatus liittyy ostajan neuvotteluvoimaan Porterin viiden kilpailuvoiman mallissa.

Tuotteessa osuus olisi yksi neuvotteluaseman signaali, ei automaattinen peruste tietylle hinnanalennukselle. Tulkinnassa pitäisi huomioida myös ostajan riippuvuus toimittajasta, vaihtoehtojen saatavuus ja toimittajan kapasiteetti.

Avoimet tietokysymykset: saadaanko riittävän tuore liikevaihto, kohdistuvatko ostot oikeaan juridiseen yhtiöön vai konserniin ja ovatko ajanjaksot vertailukelpoisia?

## 7. Ehdotus ensimmäisen version rajaukseksi

Seuraava rajaus on ehdotus keskusteluun:

**Ensimmäinen versio auttaa ostajaa löytämään yhden hankintakategorian nykyisistä, hyväksytyistä toimittajista vertailukelpoiset hintaerot ja valmistelemaan niiden perusteella neuvottelun.**

Mahdollinen käyttäjäpolku:

1. Ostaja tuo rajatun aineiston nimikkeistä, toimittajista, hinnoista ja ostomääristä.
2. Procus muodostaa priorisoidun listan tarkasteltavista kohteista.
3. Ostaja avaa kohteen ja näkee vertailun, säästöarvion sekä perustelut ja puuttuvat tiedot.
4. Procus tuottaa muokattavan neuvottelusuunnitelman.
5. Ostaja kirjaa päätöksen ja lopputuloksen, jotta ehdotettua ja toteutunutta hyötyä voidaan seurata.

Tällä rajauksella voidaan selvittää ensin, syntyykö nykyisestä datasta riittävän luotettavia ja käyttökelpoisia toimenpiteitä. BOM-pohjainen kustannusmalli, ulkoisten toimittajien haku ja liikevaihtoon perustuva neuvotteluasema voidaan lisätä, jos ne osoittautuvat ensimmäiselle asiakkaalle olennaisiksi.

Mahdolliset onnistumisen mittarit ovat ostajan hyväksymien havaintojen osuus, valmisteluun kuluvan ajan muutos ja todennettu säästö. Näiden määritelmät ja tavoitetasot ovat vielä avoimia.

## 8. Tärkeimmät avoimet kysymykset ennen toteutusta

1. Mikä on ensimmäinen asiakassegmentti ja konkreettinen hankintakategoria?
2. Mitä tuotteiden määrää koskeva alkuperäinen rajaus tarkoittaa?
3. Kuka käyttää tuotetta päivittäin, kuka omistaa työnkulun ja kuka päättää ostosta?
4. Mikä on ensimmäinen arvokas käyttötapaus: sisäiset hintaerot, hinnannousut vai kustannusindeksien ja ostohinnan välinen ero?
5. Mitä dataa mahdollinen pilottiasiakas pystyy oikeasti toimittamaan, ja millä tarkkuudella?
6. Miten sama tai korvaava nimike tunnistetaan eri toimittajien aineistoista?
7. Kuinka vapaasti tilauksia voi siirtää nykyisten toimittajien välillä?
8. Mikä laukaisee toimenpiteen, kuinka usein data päivittyy ja mitä ostaja hyväksyy itse?
9. Miten neuvottelutavoitteet perustellaan ja miten säästön toteutuminen todennetaan?
10. Miten alle 100 000 euron kohderajaus määritellään ja mikä on riittävä hyöty yksittäisestä kohteesta?

Seuraava vaihe: vastataan keskeisiin rajauskysymyksiin ja kuvataan niiden perusteella yksi konkreettinen työnkulku aidosta lähtödatasta ostajan päätökseen. Teknologia- ja arkkitehtuurivalinnat tehdään tämän jälkeen.
