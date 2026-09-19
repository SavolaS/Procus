# Procus — kilpailijatutkimus, ominaisuusideat ja erottuminen

Päivitetty ja lähteet tarkistettu: 19.9.2026. Tila: tutkimukseen perustuva ehdotus, ei hyväksytty toteutuslista tai validoitu kilpailuetu.

**Design ei ole lukittu. Perustajan mukaan nykyinen koodipohja on UI:n ja UX:n osalta heikko prototyyppi.** Nykyinen ulkoasu, navigaatio, komponentit ja vuorovaikutus saa suunnitella uudelleen. Tämän muistion työnkulut kuvaavat käyttäjän tehtäviä ja tarvittavaa tietoa; ne eivät määrää ruutujen rakennetta. Muiden kehittäjien tai agenttien designuudistuksia ei pidä kumota vanhan prototyypin tai näiden ehdotusten perusteella.

Liittyvät muistiot: [tuotesuunnitelma](procus-tuotesuunnitelma.md), [kehitysehdotukset](procus-kehitysehdotukset.md), [alkuperäinen idea](procus.md).

## 1. Johtopäätös: idea tarvitsee tarkemman aloituskohteen

Procusin mahdollisuus on tehdä asiakkaalle tärkeä mutta nykyisin liian työläs hankintatehtävä kannattavaksi. Pelkkä AI-neuvotteluavustaja, hintapoikkeamien seuranta, RFQ:n generointi tai pieniin hankintoihin keskittyminen ei tämän otoksen perusteella riitä erottumiseen. Kilpailijat kuvaavat jo näitä toimintoja, osin hyvin lähellä alkuperäistä ideaa.

**Ehdotettu arvolupaus:** Procus auttaa pientä teollista hankintatiimiä viemään nykytoimittajan hinnanmuutoksen ajoissa tarkistetuksi vertailuksi, käyttökelpoiseksi neuvotteluksi ja ostoista todennettavaksi tulokseksi — myös silloin, kun yksittäinen sopimus on liian pieni pitkään valmisteluun.

Tämä on rajaus testattavaksi, ei väite tyhjästä markkinaraosta. Todellinen etu pitäisi osoittaa valmistelutyön määrässä, vertailujen luotettavuudessa, ensimmäisen hyödyn saavuttamisen vaivassa ja asiakkaan halussa maksaa. Ostajan nykyinen Excel-, sähköposti- ja ERP-työtapa on yhtä tärkeä vertailukohta kuin uusi ohjelmisto.

## 2. Tutkimustapa ja näytön rajat

Kolme rinnakkaista tutkimusagenttia tarkasteli eri alueita: kilpailutus ja neuvottelu; kustannus- ja suorien hankintojen analyysi; hankintapyyntöjen vastaanotto ja työnkulut. Pääagentti yhdisti tulokset nykyiseen konseptiin ja tarkisti lisäksi ERP:n RFQ-perustoimintoja sekä lähimpiä päällekkäisyyksiä.

Alla kuvattu kilpailijaominaisuus tarkoittaa, että valmistajan oma sivu kuvaa sen. Se ei osoita ominaisuuden toimivan asiakkaan aineistolla, kuuluvan jokaiseen lisenssiin tai olevan saatavilla kaikilla alueilla. Asiakasdemoja, hinnoittelutarjouksia ja riippumatonta suorituskykyvertailua ei tehty. Valmistajien säästöprosentteja ei siirretä Procusin lupauksiksi. Sivun vaikenemista jostakin ominaisuudesta ei tulkita sen puuttumiseksi, eikä kilpailijan kilpailijoistaan esittämiä vertailuja käytetä näyttönä.

## 3. Kilpailijakartta ja opittavat asiat

### Kilpailutus ja neuvottelu

| Tuote | Valmistajan kuvaama kyvykkyys ja lähde | Johtopäätös Procusille |
| --- | --- | --- |
| Pactum Price List Agent | Nykytoimittajien nimikehintojen seuranta ja autonominen neuvottelu; historia, indeksit ja kysyntäennusteet perusteluissa; hyväksymisrajat ja säästöseuranta. Kohteina myös suorien hankintojen pienemmät nimikkeet. [Price List Agent](https://pactum.com/price-list-agents). | Läheinen päällekkäisyys alkuperäiseen ideaan. Nykytoimittajat, indeksit ja pienet hankinnat eivät yksin muodosta eroa. Procusin suppeampi, ostajan ohjaama polku on testattava asiakastarpeena. |
| Keelvar | Kilpailutuksen automaatio ja hinta-, kapasiteetti- sekä ehtorajoitteiden optimointi. Rate Managerin nykyinen tuotesivu kuvaa hinnastojen hallintaa ja kilpailutuksen käynnistämistä ennen ehtojen umpeutumista. [Sourcing Optimizer](https://www.keelvar.com/sourcing-optimization-software), [Rate Manager](https://www.keelvar.com/rate-manager). | Pelkkä kilpailutuksen ajoittaminen tai vaihtoehtojen simulointi ei ole uusi tuoteryhmä. Rajaa ensimmäinen skenaario asiakkaan konkreettiseen päätökseen. |
| Fairmarkit | RFx-pohjat, toimittajaryhmät, pienten pyyntöjen niputus, moniriviset tarjoukset ja hyväksynnät; arvioinnissa skenaariot sekä tekniset ja kaupalliset arvioijat. [RFx Agent](https://www.fairmarkit.com/platform/execution-agent), [Evaluation Agent](https://www.fairmarkit.com/platform/evaluation-agent). | Pitkä häntä on jo suoraan kilpailtu kohde. Mittaa käyttökelpoisia tarjouksia ja käsittelytyötä, älä vain generoituja tarjouspyyntöjä. |

Fairmarkitin käyttöohje kuvaa myös oman historian vertailuhinnan: aiemmat tarjoukset ja tuodut ostot, nimikekoodien käyttö sekä lähteen tarkistus. Moniselitteisessä osumassa arvoa ei lisätä. Tämä on konkreettinen muistutus siitä, ettei lähteistetty sisäinen hintavertailukaan ole uusi idea. [Historical benchmark](https://docs.fairmarkit.com/content/buyers/rfq/benchmark-historical.htm).

Keelvarin maaliskuun 2025 Rate Manager -julkaisu sijoitti osan automaatiosta tulevaan kehitykseen, kun nykyinen tuotesivu kuvaa sitä ominaisuutena. Asiakkaan saatavuus ja lisenssi on silti varmistettava tuotedemossa. [Julkaisutiedote 31.3.2025](https://www.keelvar.com/newsroom/keelvar-launches-rate-manager).

### Kustannustieto ja suorat hankinnat

| Tuote | Valmistajan kuvaama kyvykkyys ja lähde | Johtopäätös Procusille |
| --- | --- | --- |
| Sievo | Suorien hankintojen materiaalien ja toimittajien yhtenäistäminen, yksikkö- ja valuuttamuunnokset, BOM-yhteys, indeksit ja nykyisen toimittajakannan vaihtoehdot. Aloitteiden hallinta yhdistää mahdollisuudet, sovitut laskentamallit ja ostodatasta seurattavat säästöt. [Direct Procurement](https://sievo.com/solutions/direct-procurement), [Initiative Management](https://sievo.com/products/initiative-management). | Datan yhteismitallisuus ja tulosseuranta ovat kilpailtua ydintoimintaa. Kevyttä käyttöönottoa ei voi julistaa eduksi ilman vertailua; Sievo kuvaa myös erilliskäyttöä ja Excel-tuontia. |
| aPriori | Valmistuksen should-cost-mallit ja skenaariot huomioivat materiaalia, prosesseja, työtä ja muita kustannuksia. aiSource yhdistää kustannustiedon, tarjoukset, neuvotteluohjeet ja sisäisen yhteistyön. [Simulation](https://www.apriori.com/simulation/), [aiSource](https://www.apriori.com/solutions/products/aisource/). | Kattava valmistuskustannusmalli on oma suuri tuotteensa. Procus voi aloittaa sopimusehdon tarkistuksesta ja rajatusta kustannussignaalista, mutta ei väittää niiden vastaavan täyttä should-cost-analyysiä. |
| Part Analytics | Osatieto, hyväksytyt komponentit, saatavuus ja riskit sekä RFQ:n, vertailun, neuvottelun ja valinnan työnkulku. [Part IQ](https://partanalytics.com/electronic-components-parts-management-part-iq/), [RFQ IQ](https://partanalytics.com/rfq-iq/). | Osan hyväksyntä ja saatavuus kuuluvat hintavertailuun. Elektroniikkakomponentit eivät ole automaattisesti helppo ensimmäinen markkina; tällä alueella on jo erikoistunut kilpailija. |

### Pyyntöjen vastaanotto ja hankintatyön ohjaus

| Tuote | Valmistajan kuvaama kyvykkyys ja lähde | Johtopäätös Procusille |
| --- | --- | --- |
| Zip | Luonnollisen kielen pyynnöt, hyväksyntäreititys, hintavertailu ja neuvottelupohjat. Kilpailutuksessa RFx-luonti dokumenteista, arviointi, aikataulut ja tulosseuranta. [Intake-to-Procure](https://zip.com/products/intake-to-procure), [Sourcing](https://zip.com/products/sourcing). | Alkuun pääsyn pitää olla helppoa, ja omistajan sekä seuraavan askeleen pitää näkyä. Neuvottelupohja, uusimismuistutus tai tulosdashboard eivät yksin erotu. |
| Levelpath | Dokumenteista esitäytettävät pyynnöt ja reititys. Kilpailutuksessa tarjousten ja ehtojen vertailu sekä sopimusehtoihin, hintahistoriaan ja toimittajatietoon perustuva neuvotteluvalmistelu. [Intake & Orchestration](https://www.levelpath.com/capabilities/intake-orchestration), [Sourcing](https://www.levelpath.com/capabilities/sourcing). | Samat tarkistetut tiedot kannattaa käyttää koko työnkulussa. Pelkkä sujuva game plan -teksti ei riitä: arvon on synnyttävä oikeasta päätöksestä ja vähenevästä työstä. |
| Omnea | Mukautuva pyyntöjen vastaanotto, olemassa olevien toimittajien hyödyntäminen ja työnkulun näkyvyys. Sourcing-tuote kohdistuu myös pienten hajanaisten hankintojen kilpailutuksen automatisointiin. [Intake Management](https://www.omnea.co/products/intake-management), [Sourcing](https://www.omnea.co/products/sourcing). | Pienten hankintojen automaatio on jo markkinointilupaus muualla. Procusin mahdollinen etu on osoitettava tietyssä kategoriassa ja asiakkaan aineistolla. |
| Microsoft Dynamics 365 | RFQ:n lähetys useille toimittajille, vastausten kirjaaminen, hintojen ja muiden ehtojen vertailu, pisteytys sekä tarjouksen yksittäisten rivien hyväksyntä. [RFQ overview](https://learn.microsoft.com/en-us/dynamics365/supply-chain/procurement/request-quotations). | Tavallinen tarjousvertailu on myös ERP:n perustoiminto. Procusin pitäisi täydentää asiakkaan jo maksamaa järjestelmää ja ansaita lisätyökalun paikka. |

## 4. Mistä voisi syntyä todennettava ero?

### A. Yksi toistuva päätös, pieni kokonaisvalmistelun työmäärä

Ensimmäiseksi kokeeksi ehdotetaan nykytoimittajan hinnankorotusilmoituksen tai uuden hinnaston käsittelyä yhdessä teollisessa kategoriassa. Asiakkaalla on paljon toistuvia rivejä, vähän ostajien aikaa ja oikeus neuvotella tai käyttää hyväksyttyä vaihtoehtoa. Pakkausmateriaalit tai standardoidut tarvikkeet ovat esimerkkiehdokkaita; valinta tehdään saatavan datan ja ostajan toimintamahdollisuuden perusteella.

Hinnankorotus on konkreettinen tapahtuma: mikä muuttui, milloin se vaikuttaa ja mitä on tehtävä ennen seuraavaa ostoa? Jos asiakkaalla on parempi rinnakkaisten hintojen aineisto kuin muutoshistoria, aloitus voidaan vaihtaa sisäiseen hintavertailuun. Kategoriaa tai yrityskokoa ei lukita markkinatutkimuksen perusteella.

**Mahdollinen ero:** ostaja pääsee tuodusta aineistosta hyväksymään käyttökelpoisen valmistelun pienemmällä kokonaisvaivalla kuin nykytyötavassa tai vaihtoehtoisessa tuotteessa. Tähän lasketaan myös käyttöönotto, aineiston puhdistus ja korjaukset. Nopeutta ei vielä luvata asiakkaalle.

### B. Vaihtoehto on käyttökelpoinen juuri kyseisellä päätöshetkellä

Halvempi historiallinen ostohinta, hyväksytty toimittaja ja voimassa oleva toimituskelpoinen tarjous ovat eri asioita. Procus voisi tehdä erot näkyviksi ja valita seuraavan toimenpiteen sen mukaan, mikä vielä puuttuu. Osan revisio, tehtaan hyväksyntä, siirrettävä määrä, kapasiteetti, toimitusaika ja tarjouksen voimassaolo ratkaisevat, onko vaihtoehto uskottava.

**Mahdollinen ero:** tuotteella valmistellut tapaukset läpäisevät ostajan tarkistuksen vähäisemmillä täsmennyskierroksilla. Tarkistusten olemassaolo ei ole itsessään uniikkia; niiden toimivuus ja työmäärä on vertailtava.

### C. Sama todiste kulkee valmistelusta toteumaan

Havainto, lähdehinta, laskennan oletukset, RFQ-rivi, neuvottelun päätös ja muutoksen jälkeinen ostorivi yhdistetään. Jos uusi sovittu hinta ei toteudu laskulla, tuote muodostaa selvitettävän poikkeaman. Käyttö ei siten pääty raporttiin tai valmiiseen viestiin.

**Mahdollinen ero:** asiakkaan on helpompi selvittää, miksi vaikutusarvio muuttui ja kuka korjaa poikkeaman. Säästöseuranta on jo kilpailijoilla; tavoite on parempi jatkuvuus tässä rajatussa työnkulussa.

### D. Kertyvä etu tulee tarkistuksista ja käyttöönotosta

Mahdollinen ajan myötä vahvistuva etu olisi asiakkaan hyväksymä nimikevastaavuuksien, ehtotulkintojen, toimittajakelpoisuuden ja päätösten historia. Se vähentäisi toistuvaa korjaamista seuraavassa hankinnassa. Lisäksi valitun kategorian toimiva tietojen tuonti ja käytännön neuvottelupohjat voivat parantaa käyttöönottoa.

Tämä ei vielä ole puolustettava kilpailuetu: kilpailijat voivat rakentaa saman, data voi jäädä puutteelliseksi ja asiakas voi käyttää tuotetta liian harvoin. Pelkkä yleinen kielimalli tai chat-näkymä ei luo vaikeasti kopioitavaa etua. Asiakkaiden välisiä hintavertailuja ei oleteta käytettävissä oleviksi; datan käyttöoikeudet ja vertailukelpoisuus olisi selvitettävä erikseen.

## 5. Ominaisuusideat ja ehdotettu järjestys

Taulukon tasot ovat ehdotus kokeiden järjestykseksi. Ne eivät muuta aiemmin vahvistettuja tuotetavoitteita eivätkä sido UI-suunnittelua. Lähde tarkoittaa inspiraatiota kilpailijakartan kuvauksista; Procus-sovellus on oma ehdotus.

| Idea | Inspiraatio | Ensimmäinen hyödyllinen toteutus | Taso ja riippuvuus |
| --- | --- | --- | --- |
| Muuttuneen hinnaston tarkistus | Pactum, Sievo | Näytä vanha/uusi hinta, yksikkö, voimaantulo ja lähde. Erota ilmoitus hyväksytystä ehdosta. | P0: kaksi aineistoversiota ja luotettava rivikytkentä. |
| Vertailukelpoisuuden tarkistus | Sievo, Part Analytics, Levelpath | Tarkista revisio, yksikkö, pakkauskoko, määräporras, valuutta, toimitusehdot ja osakohtainen hyväksyntä. Näytä ristiriita korjattavana. | P0: rajattu nimikeryhmä; epäselvä rivi ei päädy varmasti halvimmaksi. |
| Perusteiden erottelu | aPriori, Pactum | Erota sopimuskaava, historiavertailu, voimassa oleva tarjous ja oletuksiin perustuva kustannussignaali. Lähde avautuu perustelusta. | P0: ainakin yksi tarkistettava peruste; täydellistä BOMia ei vaadita. |
| Kaksi valmistelupolkua samasta aineistosta | Levelpath, aPriori | Nykytoimittajan hinnantarkistus tai vaihtoehtoisen toimittajan RFQ. Sisäinen game plan ja jaettava aineisto erikseen. | P0: ostaja vahvistaa askin ja LAA:n; ei lähetysautomaatiota ensimmäisen kokeen ehtona. |
| Tarjousvertailu ja vain puuttuvien tietojen kysyminen | Fairmarkit, Levelpath, Dynamics 365 | Vertaa ehtoja rinnakkain, tunnista puute ja luonnostele kohdennettu täsmennyspyyntö. | P0: esimerkkitarjouksilla; P1: oikeiden vastausten tuonti. |
| Valmistelun ajoitus ja tarjouksen vanheneminen | Keelvar, Zip | Laske ehdotettu aloitus päätöspäivästä, vastausajasta, hyväksynnästä ja toimitusajasta. Pyydä vanhenevan tarjouksen vahvistus. | P1: päivämäärien ja oletusten tarkistus. |
| Toimittajakohtainen neuvottelupaketti | Pactum, Keelvar | Yhdistä saman keskustelun pienet rivit; säilytä rivien omat ehdot, vaikutukset ja päätökset. | P1: yhteinen päätösajankohta; kiireellinen rivi ei saa odottaa niputusta. |
| Ostojen jaon skenaariot | Keelvar, Part Analytics | Vertaa jatkamista, hinnanparannusta ja rajattua siirtoa hyväksytylle vaihtoehdolle. Näytä kapasiteetti, sitoumukset ja vaihtokustannukset. | P1: kaksi toimittajaa, tunnetut rajoitteet; ei automaattista optimointilupausta. |
| Toimittajalle kevyt vastaaminen | Fairmarkit, Omnea | Yhteinen vastauspohja ja mahdollisuus käyttää tuttuja kanavia. Ostaja näkee, keneltä puuttuu vertailukelpoinen vastaus. | P1: valitaan yksi kanava asiakkaan kanssa; portaalin tarve testataan. |
| Toteuman poikkeamat | Sievo, Zip | Yhdistä sovittu ehto ostoriviin, näytä hinnan poikkeama ja vastuuhenkilö. | P1: aito ostodata; toteutunutta säästöä ei päätellä statuksesta. |
| Kategorian kustannusskenaario | aPriori, Sievo | Rajattu indeksi ja perusteltu kustannusosuus; vaihteluväli ja herkkyys yhden pistearvion sijaan. | P2: lähteen käyttöoikeus, soveltuvuus ja kustannusrakenne. |
| Toimittajan vastaushistoria | Fairmarkit | Näytä vasteaika ja tarjousten täydellisyys; käytä niitä vastaanottajien valinnan tukena. | P2: riittävä oma historia; uusi toimittaja ei ole huono vain puuttuvan historian vuoksi. |
| Rajattu neuvotteluautomaatio | Pactum, Fairmarkit | Kokeile ensin luonnoksia ja ostajan hyväksyntää. Mahdollinen automaatio rajataan erillisenä tuotevalintana. | P2: näyttö laadusta, toimittajakokemuksesta ja asiakkaan sallimasta autonomiasta. |

### Asiat, joita ei ehdoteta ensimmäisen kokeen edellytyksiksi

Täyttä ERP-korvaajaa, yleistä hankintapyyntöjen ja hyväksyntöjen alustaa, maailmanlaajuista toimittajahakua, konekohtaista valmistussimulaatiota tai itsenäisesti sopimuksia tekevää agenttia ei tarvita alkuhypoteesin testaamiseen. Nämä ovat myöhempiä vaihtoehtoja, eivät pysyvästi poistettuja tuotetavoitteita. PDF-, sähköposti-, BOM- ja toimittaja-analyysin pidemmän aikavälin suunta säilyy; kaikkea ei tarvitse toteuttaa yhtä aikaa.

## 6. Konkreettinen seuraava demo ja asiakaskoe

**Tilanne:** nykytoimittaja lähettää uuden hinnaston. Ostajalla on aikaisempi hinta, ostorivejä ja toiselta toimittajalta saatu tarjous. Demo käyttää selvästi merkittyä esimerkkidataa; pilotti asiakkaan luvallisesti toimittamaa aineistoa.

1. Procus tunnistaa muutoksen ja sen tulevan voimaantulon. Havainto ei vielä muuta hyväksyttyä sopimushintaa.
2. Ostaja tarkistaa nimikekytkennät. Yhdessä tarjouksessa hinta koskee eri pakkauskokoa, toisessa voimassaolo päättyy ennen hankintaa. Järjestelmä näyttää molemmat korjattavina, ei varmana säästönä.
3. Procus erottaa sopimuksen hinnantarkistusehdon kustannusindeksin taustasignaalista. Jos malliin ei ole riittäviä tietoja, se ehdottaa kysymystä toimittajalle.
4. Ostaja valitsee nykytoimittajan neuvottelun tai vaihtoehdon RFQ:n. Molemmat käyttävät samaa tarkistettua lähtötilannetta. Game planin LAA säilyy sisäisenä.
5. Tarjous täydentyy tai vahvistuu. Ostaja näkee, onko vaihtoehto hyväksytty kyseiselle osalle ja toimitusajalle. Tieto päätöksen esteestä on tärkeämpi kuin vihreä yleisstatus.
6. Ostaja kirjaa päätöksen ja voimassaoloajan. Sovittu vaikutus lasketaan ilmoitetulle tulevalle volyymille; rinnakkaisten vaihtoehtojen hyötyjä ei summata.
7. Myöhempi ostorivi yhdistetään päätökseen. Väärä laskutushinta synnyttää selvitystehtävän; todennettu vaikutus näkyy erikseen arviosta.

Tämän voi esittää listana, työtilana, aikajanana tai muulla testissä toimivalla rakenteella. Nykyisen sovelluksen kolmea näkymää ei tarvitse jäljitellä. Todellinen lähetys, integraatio tai saapunut tarjous merkitään todeksi vain, jos tapahtuma on oikeasti toteutunut.

## 7. Laskennan ja aineiston rajat

- Historiallinen ostohinta ei ole lupaus nykyisestä tarjouksesta. Toimittajan yleinen hyväksyntä ei ole hyväksyntä juuri kyseiselle osalle tai tehtaalle.
- Raaka-aineindeksin muutos ei sellaisenaan määrää lopputuotteen hintaa. BOMin materiaalin paino-osuus ei ole kustannusosuus. Sopimuskaavan tarkistus erotetaan oletuksiin perustuvasta kustannusarviosta.
- Mahdollinen, sovittu ja toteutunut vaikutus käyttävät nimettyä lähtötasoa ja aikajännettä. Vältetty korotus pidetään erillään nykyhintaan verrattavasta alennuksesta.
- Hintavaikutus voidaan havainnollistaa summana `(vertailuhinta − toteutunut vertailukelpoinen yksikköhinta) × toteutunut määrä`, vähennettynä kohdistettavilla lisäkustannuksilla. Valuutta-, määrä-, tuotejakauma- ja ehtomuutosten käsittely sovitaan talouden kanssa; kaava ei yksin ratkaise niitä.
- Jos vaihtokustannus, rahti tai olennainen ehto puuttuu, nettohyötyä ei esitetä varmana. Arvio on rajattu ja näyttää puuttuvat tekijät. Samalle volyymille vaihtoehtoiset neuvottelu- ja siirtopolut ovat toisensa poissulkevia laskentavaihtoehtoja.
- Julkinen repository sisältää vain esimerkkidataa ja yleisiä suunnittelumuistioita. Pilotin sopimukset, oikeat hinnastot ja ostoaineistot käsitellään erillisessä asiakkaan hyväksymässä ympäristössä.

## 8. Miten erottuminen ja maksuhalukkuus testataan?

Ehdotettu koe: 3–5 ostajaa, yksi kategoria ja noin 10–20 käsiteltävää tapausta. Tämä on työmääräehdotus, ei tilastollisen yleistettävyyden lupaus. Verrataan vastaavia tapauksia nykytyötavalla ja Procusilla; samaa tehtävää ei tehdä aina ensin käsin, jotta oppimisvaikutus ei selitä koko eroa. Avoimet ja epäonnistuneet tapaukset säilyvät nimittäjissä.

| Hypoteesi | Mitattava asia | Ehdotettu jatko- tai hylkäyskriteeri |
| --- | --- | --- |
| Valmistelu vie vähemmän aikaa | Ostajan aktiivinen työaika, kokonaisläpimenoaika sekä tietojen korjaus- ja tukityö erikseen. | Tavoite: vähintään 50 % pienempi aktiivisen valmistelutyön mediaani ilman kriittisten virheiden kasvua. Jos ei toteudu, rajaa työnkulku uudelleen. |
| Vertailu on luotettava | Yksikön, nimikkeen, voimassaolon, hyväksynnän ja laskennan virheet ostajan tarkistuksessa. | Tavoite: ei ratkaisemattomia kriittisiä virheitä hyväksytyssä materiaalissa. Yksikin väärä hyväksyntä tai keksitty lähde pysäyttää kyseisen suosituksen käytön. |
| Vaihtoehdot ovat käytettäviä | Kuinka monessa valitun kohdejoukon tapauksessa saadaan vertailukelpoinen tarjous tai perusteltu nykytoimittajan neuvottelupohja ajoissa? | Sovitaan tavoite lähtötilanteesta ennen koetta. Pelkkä toimittajaehdokkaiden tai RFQ:iden määrä ei riitä. |
| Hyöty toteutuu | Sovittu ehto, ensimmäiset sen jälkeiset ostot, kohdistettavat kulut ja hinnan toteutuminen. | Jos ostodataa ei vielä ole, tulos jää sovituksi. Kaupallista säästöväitettä ei tehdä ennen todentamista. |
| Palvelu kannattaa tuottaa | Asiakkaan hyöty, oma käyttöönotto- ja korjaustyö, datalisenssit, tuki ja ohjelmiston käyttö. | Positiivinen arvo valitulla kohdejoukolla ja realistinen maksullinen jatko. Piilotettu käsityö tai jatkuva datan uudelleenrakennus on syy muuttaa rajausta. |
| Asiakas ostaa tämän erikseen | Kuka omistaa budjetin, mitä nykyinen työkalu jo kattaa ja suostuuko asiakas maksulliseen jatkoon? | Kiinnostus tai hyvä demo ei riitä. Tarvitaan sovittu maksullinen kokeilu tai muu konkreettinen ostopäätös. |

50 % on pilotille ehdotettu tavoite, ei kilpailijoista johdettu fakta eikä Procusin saavutettu tulos. Muut rajat sovitaan asiakkaan lähtötilanteesta ennen tulosten katsomista. Lyhyt pilotti voi mitata valmistelua ja päätösvalmiutta; toteutuneen säästön seuranta jatkuu hankintojen aikataulun mukaan.

### Kaupallinen aloitus ehdotuksena

Kohdista ensimmäinen keskustelu hankintapäällikköön, jolla on toistuvia pienempiä suoria hankintoja, nimetty ostaja ja mahdollisuus toimittaa rajattu aineistonäyte. Rajattu maksullinen pilotti voisi sisältää yhden kategorian, aineiston tuonnin ja sovitun tapausjoukon. Hinnoittelua ei päätetä kilpailijoiden julkisten sivujen perusteella. Jatkotarjouksessa eritellään ohjelmisto, käyttöönotto ja mahdollinen datapalvelu; säästöön sidottu palkkio vaatisi ensin yhteisen laskentasäännön ja kohdistuksen.

### Seuraavat tutkimuskysymykset

1. Saadaanko asiakkaalta uusi ja vanha hinnasto, vertailukelpoiset ostorivit sekä osakohtaiset hyväksynnät ilman mittavaa integraatiota?
2. Missä nykyinen työ tarkalleen katkeaa: rivien yhdistämisessä, tarjousten saamisessa, päätöksessä vai sovitun hinnan toteutumisessa?
3. Käsitteleekö jo käytössä oleva ERP tai hankintatyökalu saman tapauksen riittävän hyvin, jos sen käyttöönottoa vain parannetaan?
4. Miten lähimmät tuotteet suoriutuvat samalla anonymisoidulla aineistolla? Pyydä toimittajademossa todellinen työnkulku ja kokonaistyömäärä, ei ominaisuuslistaa.
5. Palaako ostaja tuotteeseen seuraavan hinnaston yhteydessä, ja väheneekö korjaustyö aiempien tarkistusten ansiosta?

Kokonaisuutena suositus on rakentaa ja mitata yksi toimiva päätösketju. Laaja ominaisuuslista ei vielä osoita, miksi asiakas vaihtaisi työkalua tai ostaisi uuden.
