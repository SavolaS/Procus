# Procus — judge-arviot ja erilliset kehitysehdotukset

Päivitetty: 19.9.2026

Uusimmat perustajan linjaukset dashboardista, toimittaja- ja tuotenäkymistä sekä sopimusten tuonnista on koottu [tuotesuunnitelmaan](procus-tuotesuunnitelma.md). Tämä muistio säilyttää aiempien ehdotusten ja arvioiden historian.

Tämä on vaihtoehtojen arviointimuistio, ei uusi hyväksytty tuotesuunnitelma. Alkuperäinen [procus.md](procus.md) säilytetään muuttamattomana. Alla olevat ehdotukset odottavat perustajan kommentteja.

## Arviointitapa

Kolme erillistä GPT-5.6 Luna -alagenttia arvioi samaa konseptia itsenäisesti: asiakkaan ostohalua, hankintalogiikan luotettavuutta sekä ensimmäisen version työnkulkua. Pääagentti kokosi niiden havainnot ja teki alla olevan synteesin.

Arviot ovat idean sisäisen logiikan kritiikkiä. Ne eivät perustu asiakashaastatteluihin, todelliseen hankintadataan tai kilpailijatutkimukseen. Samalla mallilla ja samalla lähtöaineistolla tuotettujen arvioiden yksimielisyys ei ole riippumatonta markkinavalidointia.

## 1. Mitä arvioijat nostivat esiin?

| Näkökulma | Vahvin osa | Suurin epävarmuus | Keskeinen ehdotus |
| --- | --- | --- | --- |
| Asiakas ja kaupallinen arvo | Pitkän hännän havaintojen muuttaminen säästötoimenpiteiksi | Ovatko säästöt riittäviä suhteessa käsittelytyöhön ja tuotteen hintaan? | Yksi toistuva hankintakategoria ja ostaja, jolla on valta käynnistää toimenpiteet |
| Hankintalogiikka | Vertailu nykyisten, nimikkeelle hyväksyttyjen toimittajien välillä | Ovatko hinnat vertailukelpoisia ja vaihtoehdot oikeasti käytettävissä? | Näytä perustelut, puuttuvat tiedot ja seuraava varmennettava askel |
| Ensimmäinen versio | Rajattu polku datasta neuvotteluun ja tuloksen seurantaan | Jääkö tuote raportiksi ilman päätöksiä? | Kokeile työnkulku käsin aidolla aineistolla ennen koodaamista |

Arvioijat olivat yhtä mieltä siitä, että automaattiset neuvotteluprosentit, kattava BOM-malli, uusien toimittajien haku ja liikevaihtoon perustuva neuvotteluvoima kasvattavat ensimmäisen version epävarmuutta. Tuotejudge nosti hinnannousujen seurannan vaihtoehdoksi, jos asiakkaan aikasarjadata on rinnakkaisia toimittajahintoja parempaa.

## 2. Hiottu arvolupaus keskusteluun

> Procus tunnistaa toistuvista hankinnoista tilanteet, joissa ostajan kannattaa toimia ennen seuraavaa tilausta tai hinnantarkistusta, ja kokoaa perustellun ehdotuksen neuvottelua tai ostojen uudelleenjakoa varten.

Tämä yhdistäisi alkuperäisen ennakoivuuden ja nykytoimittajiin keskittymisen konkreettiseen päätöshetkeen. Säästö olisi lopputulos; ensimmäinen käyttäjälle näkyvä hyöty olisi perustellun toimenpiteen valmistelu pienemmällä työllä.

## 3. Kuusi kehitysehdotusta

### A. Rajaa ensimmäinen kohde toimintamahdollisuuden perusteella

Alle 100 000 euron sopimus ja vähäinen jalostusaste ovat hyödyllisiä lähtörajauksia, mutta ne eivät yksin takaa vertailukelpoisuutta tai neuvottelumahdollisuutta.

Ehdotettu ensimmäinen kohde täyttäisi nämä ehdot: toistuva hankinta, tunnistettava nimike ja spesifikaatio, riittävä hintahistoria sekä lähestyvä osto- tai neuvottelupäätös. Ostojen siirtoa ehdotetaan vain, jos vaihtoehto on hyväksytty kyseiseen käyttöön ja sen saatavuus voidaan vahvistaa.

### B. Yhdistä pienet havainnot toimittajakohtaiseksi neuvotteluksi

Pitkän hännän taloudellinen ongelma koskee myös Procusia: pieni säästö ei kestä suurta valmistelu- tai selvitystyötä.

Uusi ehdotus on yhdistää saman toimittajan useat nimikehavainnot yhdeksi neuvottelukokonaisuudeksi. Ostaja näkisi kokonaisvaikutuksen, tärkeimmät rivit ja yhteisen keskustelurungon. Priorisoinnissa arvioitaisiin myös toteuttamisen vaivaa ja tunnettuja lisäkustannuksia. Niputtamisen hyöty pitää testata; se ei saa piilottaa nimikkeiden eri ehtoja tai hintaperusteita.

### C. Tee tuotteen keskeiseksi näkymäksi päätöskortti

Yhden kohteen kortti vastaisi seuraaviin kysymyksiin:

- Mikä muuttui tai poikkeaa, ja miksi asia on ajankohtainen?
- Mihin vertailu perustuu ja mitä ehtoja on huomioitu?
- Mikä on tulevien ostojen eurovaikutus ilmoitetulla volyymioletuksella?
- Mitä pitäisi tehdä seuraavaksi ja kuka tekee päätöksen?
- Mikä tieto vielä estää vahvemman suosituksen?

Kortin tila voisi olla **selvitettävä**, **valmis neuvotteluun** tai **ei toimenpidettä nyt**. Hintalähteissä erotetaan historiallinen ostohinta, voimassa oleva hinnasto tai tarjous ja vahvistettu toimitusmahdollisuus. Historiallinen halvempi ostos ei sellaisenaan todista nykyistä vaihtoehtoa.

### D. Sido seuranta oikeaan päätöshetkeen

Seuranta voi olla tiheää, mutta ostajalle tulevan ilmoituksen pitää olla hyödyllinen. Ehdotettu laukaisu yhdistää olennaisen eurovaikutuksen ja ajankohdan, jolloin ostaja voi toimia: tulevan tilauksen, uuden hinnankorotuksen tai sopimuksen uusimisen.

Jos tulevaa kysyntää ei tunneta, vaikutus voidaan arvioida historiallisella volyymilla, mutta tämä oletus näytetään. Pelkkää vanhojen ostojen analyysiä ei pidä esittää tulevien tilausten ennusteena.

### E. Johda neuvottelutavoite todisteista

Säilytetään alkuperäinen game plan -ajatus. Ensimmäisessä versiossa ostaja kuitenkin vahvistaisi avauspyynnön ja hyväksyttävän lopputuloksen rajan. Procus kokoaisi tavoitetta tukevan vertailun, argumentit ja käytettävissä olevan vaihtoehdon.

Automaattista 15 % / 5 % -logiikkaa ei ehdoteta ilman tapauskohtaista perustetta. Jos tiedot eivät tue prosenttia, ohjelma voi silti valmistella kysymykset toimittajalle. Ostajan hyväksymisraja on sisäinen tieto, jota ei sisällytetä toimittajalle tarkoitettuun viestiin.

### F. Laajenna leverage-ajatus molemminpuoliseksi riippuvuudeksi

Liikevaihto-osuus säilyisi kiinnostavana tukitietona. Sen rinnalle tarvitaan ostajan omat vaihtoehdot: kuinka suuri osa tämän nimikkeen hankinnasta riippuu toimittajasta, onko vaihtoehto hyväksytty ja kuinka kauan siirtyminen veisi?

Näin 25 %:n liikevaihto-osuus käynnistäisi riippuvuuden tarkastelun. Se ei yksin määrittäisi neuvottelutavoitetta. Tätä ominaisuutta ei tarvita ensimmäisen työnkulun kokeilemiseen.

## 4. Valitaan ensimmäinen käyttötapaus datan perusteella

| Vaihtoehto | Milloin sitä kannattaa kokeilla ensin? | Mitä ensimmäinen koe selvittää? |
| --- | --- | --- |
| Nykytoimittajien hintavertailu | Samalle nimikkeelle löytyy ajantasaisia, vertailukelpoisia hintoja ja aidosti käytettävissä oleva vaihtoehto | Johtaako sisäinen hintaero neuvotteluun tai kannattavaan ostojen siirtoon? |
| Hinnankorotuksen tarkistus | Nimikkeen historia ja uusi hinnasto tai korotusilmoitus ovat saatavilla | Pystytäänkö korotus tarkistamaan ja kyseenalaistamaan ennen seuraavaa ostoa? |
| Indeksiin perustuva kustannuspoikkeama | Yhden kategorian materiaaliosuus, soveltuva indeksi ja hinnanmuutoksen viive voidaan perustella | Auttaako kustannuskehitys löytämään ostajalle uusia neuvottelukohteita? |

Synteesin alustava suosikki on nykytoimittajien hintavertailu. Helposti rakennettava hintavertailu ei kuitenkaan vielä osoita asiakkaalle uutta arvoa. Jos ostaja tekee sen jo tehokkaasti, mutta ei pysty arvioimaan korotusten perusteita, toinen tai kolmas vaihtoehto voi olla parempi.

Indeksiajatusta ei siis poisteta. Sitä voisi kokeilla yhdessä kategoriassa rajatulla kustannusmallilla ennen kattavaa BOM-tulkintaa. Uusien toimittajien haku pysyy jatkopolkuna tilanteisiin, joissa nykyisestä toimittajakannasta ei löydy riittävää vaihtoehtoa; verkosta löydetty ehdokas ei vielä ole hyväksytty toimittaja.

## 5. Ehdotus pilotiksi ennen koodausta

1. Valitaan yksi asiakas, yksi ostaja, yksi kategoria ja yksi kolmesta käyttötapauksesta.
2. Pyydetään rajattu aineistonäyte. Ensimmäiseen seulontaan tarvitaan nimikkeet, toimittajat, päivämäärät, määrät, yksiköt, hinnat ja valuutat. Sopimus-, laatu- ja saatavuustiedot varmennetaan lupaavien kohteiden osalta ennen suositusta.
3. Valmistellaan käsin esimerkiksi kymmenen päätöskorttia. Tämä on kokeen työmääräraja, ei väite datasta löytyvien mahdollisuuksien määrästä.
4. Ostaja merkitsee, onko havainto oikea, hänelle uusi ja toimintakelpoinen, sekä miksi hän hyväksyy tai hylkää sen.
5. Viedään asiakkaan kanssa sovitut kohteet todelliseen toimenpiteeseen. Seurataan valmisteluaikaa, neuvottelutulosta ja myöhemmin toteutuneita ostoja.

Kokeessa mitataan myös aineiston puhdistamiseen ja yhden kortin tuottamiseen kuluva työ. Pelkkä ostajan ajan säästyminen ei riitä, jos palvelun tuottaminen vaatii jatkuvasti kallista käsityötä.

**Sovittavat jatkokriteerit:** kuinka moni kohde on uusi ja toimintakelpoinen, kuinka paljon työtä käsittely vaatii ja riittääkö asiakkaan todentama arvo perustelemaan maksullisen jatkon. Arvioijien ehdottamia lukurajoja ei oteta validoiduiksi tavoitteiksi; ne sovitaan asiakkaan lähtötilanteen perusteella.

**Keskeytä tai vaihda rajausta**, jos vertailuja ei saada luotettaviksi kohtuullisella työllä, ostaja ei voi toimia havaintojen perusteella tai havainnot eivät tuo uutta hyötyä. Neuvottelussa sovittu hinnanmuutos ja toteutuneilla ostoilla todennettu säästö kirjataan erikseen. Vältetty hinnankorotus erotetaan nykyhintaan verrattavasta alennuksesta, ja vertailuperuste sovitaan etukäteen.

## 6. Kysymykset perustajalle

1. Mikä konkreettinen asiakastilanne tai hankintakategoria oli Bainin konsultin kanssa käydyn keskustelun taustalla? Onko tämän datan ja ostajan kanssa mahdollista tehdä pilotti?
2. Tarkoitatko tuotteiden määrällä suurta nimikemäärää? Ovatko tuotteet standardoituja vai asiakkaan piirustusten tai spesifikaatioiden mukaan valmistettuja?
3. Onko sama nimike jo hyväksytty usealle toimittajalle, ja voiko ostaja siirtää niiden välillä tilausvolyymia?
4. Mikä tuntui keskustelussa asiakkaan tärkeimmältä ongelmalta: huomaamatta jäävät hintaerot, hinnankorotusten perusteleminen vai neuvottelun valmisteluun kuluva työ?
5. Mitä ensimmäinen asiakas voisi toimittaa helposti: ostorivit, voimassa olevat hinnastot, sopimukset, BOMit vai tulevat ostotarpeet?
6. Tarkoittaako alle 100 000 euroa nimikkeen, toimittajan vai sopimuksen arvoa, ja millä ajanjaksolla? Kuka omistaisi tämän hankintajoukon ja päättäisi Procusin ostamisesta?

## 7. Perustajan tarkennukset ensimmäisen arviointikierroksen jälkeen

Alla kirjataan perustajan vastaukset. Ne täydentävät lähtöideaa; edellisten osioiden tuote-ehdotukset eivät muutu niiden perusteella automaattisesti hyväksytyiksi päätöksiksi.

| Aihe | Perustajan tarkennus | Vielä avoinna |
| --- | --- | --- |
| Ongelman tausta | Asiakkailla on yleisesti ollut tämä ongelma. | Yksittäistä pilottiasiakasta tai ensimmäistä toimialaa ei ole nimetty. |
| Tuotteiden määrä | Esimerkiksi yhdeltä valmistajalta tilataan 100 eri tuotetta. | Tuotteiden standardointi ja asiakaskohtaisuus eivät vielä selvinneet. |
| Vaihtoehtoiset toimittajat | Usein käytössä on dual- tai multisourcing, jolloin ostoja voidaan siirtää. | Nimike- ja tilannekohtaiset siirtorajoitteet selvitetään varsinaisesta aineistosta. |
| Tärkein kipu | Valmistelutyö ja se, ettei hankintoja niiden suuren määrän vuoksi pystytä seuraamaan riittävästi. | Mitkä valmistelun vaiheet kuluttavat eniten aikaa? |
| Saatavilla oleva data | Ei vielä vastausta. | Datalähteitä tai integraatiovalmiuksia ei oleteta vahvistetuiksi. |
| Sopimuskoko | Pieniä sopimuksia yleisesti. | Tarkkaa euromääräistä rajaa ei aseteta tässä vaiheessa. |

## 8. Tarkennusten pohjalta hiottu työnkulkuehdotus

**Ehdotettu painotus: Procus seuraa nykyisten toimittajien tuotteita ja valmistelee ostajalle neuvottelukokonaisuudet, joihin tämän kannattaa käyttää aikansa.**

Tuotteen käyttäjälle näkyvä työyksikkö voisi olla toimittajakohtainen neuvottelupaketti. Sen perustana ovat edelleen nimikekohtaiset havainnot ja todisteet. Sadan tuotteen esimerkki tarkoittaa yhden toimittajasuhteen laajuutta; se ei tarkoita sataa automaattista hälytystä eikä sitä, että jokaisella tuotteella olisi vaihtoehtoinen toimittaja.

Ehdotettu käyttäjäpolku:

1. **Seuraa toimittajan nimikkeitä:** mitä ostetaan, millä hinnalla ja millaisia muutoksia tai vertailukohtia on havaittu?
2. **Valitse käsiteltävät kohteet:** erottele perustellut mahdollisuudet, lisäselvitystä vaativat havainnot ja kohteet, joissa ei tarvita toimenpidettä.
3. **Kokoa neuvottelupaketti:** näytä yhteenveto eurovaikutuksesta sekä valittujen nimikkeiden hintahistoria, vaihtoehdot, argumentit ja avoimet kysymykset.
4. **Valmistele eteneminen:** ostaja saa muokattavan keskustelurungon tai viestiluonnoksen sekä ehdotuksen siitä, mistä nimikkeistä neuvotellaan ja missä ostojen siirtoa kannattaa arvioida.
5. **Kirjaa päätös ja seuraa tulosta:** ostaja hyväksyy etenemisen, merkitsee lopputuloksen ja seuraa toteutuuko sovittu muutos ostohinnoissa.

Esimerkkitilanne ilman keksittyjä säästölukuja: yhdeltä valmistajalta ostetaan sata tuotetta. Procus nostaa osasta tuotteita perusteltuja havaintoja ja kokoaa niistä yhden valmistelumateriaalin seuraavaan toimittajakeskusteluun. Muiden tuotteiden osalta ostajalle ei synny uutta tehtävää ilman syytä. Toiselle toimittajalle siirrettävissä oleva volyymi arvioidaan nimikkeittäin.

Arvon todentamisessa korostuvat valmisteluun käytetty aika, ostajan käsiteltäväksi tulevan työn määrä ja se, kuinka suuri osa hankinnoista saadaan seurannan piiriin riittävällä tiedolla. Säästö ja ostojen siirron toteutuminen säilyvät lopputulosmittareina.

Seuraavaksi täsmennetään, mitä ostaja tekee nykyisin valmistellessaan yhden toimittajan neuvottelua ja minkä valmiin tuotoksen hän haluaa Procusilta. Datan saatavuus pidetään avoimena toteutettavuuskysymyksenä.

### Tuotejudgen jatkoarvio

GPT-5.6 Luna -tuotejudge arvioi myös perustajan tarkennukset ja tämän työnkulkuehdotuksen. Se piti toimittajapakettia valmistelutyön ongelmaan sopivana, mutta nosti keskeiseksi vastaväitteeksi sen, että kokonaisuus voi peittää yksittäisten nimikkeiden heikot vertailuperusteet. Siksi paketin eurovaikutukseen sisällytettävät kohteet on eriteltävä ja epävarmat mahdollisuudet esitettävä erikseen. Eri toimenpidevaihtoehtojen säästöjä ei summata, jos ne koskevat samaa ostovolyymia.

Jatkoarviossa ehdotettiin myös erottamaan sopimukseen kirjatun indeksiehdon toteutumisen tarkistus laajemmasta kustannusmallista. Ensimmäisessä tarkistetaan sovittua laskentasääntöä; jälkimmäisessä arvioidaan kustannusrakennetta oletusten avulla. Kumpaakaan tietopohjaa ei ole vielä vahvistettu saatavaksi.

## 9. Whiteboardin pohjalta ehdotetut parannukset

Lisätty: 19.9.2026. Tämä osio on pääagentin tuotesuunnitteluehdotus perustajan uusimpien tarkennusten pohjalta. Se ei ole uusi judge-kierros, asiakasvalidointi tai hyväksytty toteutuslista. Tuotteen nykyinen suunta on [tuotesuunnitelmassa](procus-tuotesuunnitelma.md).

### Keskeinen parannushypoteesi

**Procus auttaa ostajaa saapumaan neuvotteluun ajoissa, ajantasaiset tarjoukset ja perusteltu suunnitelma valmiina.**

Pienen sopimuksen käsittelyn pitää vaatia niin vähän ostajan aikaa, että siihen kannattaa tarttua. Jatkuva analyysi palvelee tätä, kun se ajoittaa valmistelun, käyttää olemassa olevia tietoja uudelleen ja kokoaa pienet kohteet järkeviksi kokonaisuuksiksi.

Whiteboardin “Realm for buy side” säilyy inspiraationa. Tässä muistiossa ei oleteta tai arvioida Realmin nykyisiä ominaisuuksia. “Procurement cost” kannattaa täsmentää kahdeksi erikseen mitattavaksi asiaksi: ostettavien tuotteiden kokonaiskustannus ja hankintatyön oma kustannus.

### A. Suunnittele valmistelu päätöspäivästä taaksepäin

Käyttäjä näkee sopimuksen päättymispäivän lisäksi, milloin seuraavaa päätöstä pitää alkaa valmistella. Procus muodostaa ehdotetun aikataulun tarjousvastauksille, vertailulle, neuvottelulle ja tarvittaville hyväksynnöille. Vaihtoehtoisen toimittajan käyttöönoton vaatima aika ja sopimuksen mahdollinen aikaisempi ilmoitusmääräaika huomioidaan, jos ne tunnetaan.

**Esimerkki:** uudelleenneuvottelu on kolmen kuukauden päästä. Procus ehdottaa RFQ:n valmistelua nyt, jotta ostaja ehtii pyytää tarjoukset, varmistaa vertailukelpoisuuden ja käyttää niitä neuvottelussa. Aikataulun kestot ovat ostajan tarkistettavia oletuksia.

Dashboardiin voisi tulla “Valmistaudu seuraaviin päätöksiin” -osio: päätöspäivä, valmistelun aloitus, tarjoukset ja puuttuva seuraava askel. Sama näkymä näyttää, jos tarjouksen tai uuden toimittajan hyväksynnän valmistuminen on myöhästymässä.

### B. Seuraa tarjouksen käyttökelpoisuutta tulevaan hankintaan

Kolme kuukautta aikaisemmin saatu tarjous auttaa vain siltä osin kuin sitä voi käyttää päätöksessä. Tarjouksesta tallennetaan erikseen vastauspäivä, hyväksymisen määräaika, hinnan soveltamiskausi, pyydetty toimituskausi, määräehdot ja kapasiteetin vahvistus. RFQ:n vastausdeadline on eri asia kuin saadun tarjouksen voimassaolo.

Ehdotetut valmiuden kuvaukset ovat **Alustava hintatieto**, **Voimassa oleva tarjous**, **Vahvistettava ennen päätöstä** ja **Vanhentunut**. Näiden rinnalla näytetään konkreettiset puuttuvat hyväksynnät tai ehdot. Voimassa oleva tarjous ei itsessään tarkoita varattua kapasiteettia tai hyväksyttyä toimittajaa.

RFQ pyytää hintaa nimenomaan tulevalle hankintajaksolle. Jos toimittaja ei sitoudu siihen asti, Procus kirjaa vahvistustarpeen ja ehdottaa sopivaa tarkistusajankohtaa. Saman tarjouksen uusittu versio korvaa vertailussa vanhan mutta säilyttää historian.

### C. Hyödynnä yrityksen nykyinen toimittajaverkosto

Kun osalle etsitään tarjouksia, Procus ehdottaa sopivia yrityksen jo käyttämiä toimittajia ja kertoo ehdotuksen perusteen: sama osa, sama valmistusmenetelmä, sama materiaalikategoria tai aikaisempi tarjous. Mukana voi olla myös toisen tehtaan tai tiimin käyttämä toimittaja, jos käyttäjällä on oikeus nähdä tiedot.

Ehdotuksessa erotetaan osalle jo hyväksytty toimittaja, yrityksen muu nykytoimittaja ja kokonaan uusi ehdokas. Yleinen toimittajahyväksyntä ei korvaa osan tai tehtaan vaatimusten tarkistusta. Samankaltaisuus voi perustella tarjouspyynnön, mutta ei automaattista ostojen siirtoa.

**Hyötyhypoteesi:** ostajan ei tarvitse aloittaa vaihtoehtojen etsimistä tyhjästä, ja yrityksen aiempi toimittajatieto palvelee myös pieniä hankintoja. Ensimmäinen toteutus voi käyttää rajattua toimittajalistaa; yrityksen laajuinen haku on laajennus.

### D. Kokoa pienistä kohteista yksi käsiteltävä paketti

Jos samalta toimittajalta ostetaan sata osaa, Procus ehdottaa samaan tapaamiseen tai tarjouspyyntöön sopivia osia yhdessä. Paketti näyttää tärkeimmät rivit, kokonaisvaikutuksen ja yhteisen keskustelurungon. Rivikohtaiset ehdot, tietopuutteet ja hinnat pysyvät näkyvissä.

Niputus voi perustua samaan toimittajaan, kategoriaan, päätösajankohtaan tai toimitustarpeeseen. Se ei saa viivästyttää kiireellistä kohdetta. Tarjouksessa erotetaan yksittäisten rivien hinnat ja vain koko paketin ostolla saatava alennus, jotta samaa hyötyä ei lasketa kahdesti.

Ehdotettu päätoiminto toimittajan näkymään on **Valmistele seuraava toimittajatapaaminen**. Se kokoaa hinnanparannuskohteet, vertailutarjoukset, askit, LAA:t ja toimittajasuhteen yhteiset kysymykset.

### E. Tee toimittajalle vastaamisesta helppoa

Enemmän käyttökelpoisia tarjouksia edellyttää myös toimittajan työn huomioimista. RFQ:ssa ovat valmiina osakoodit, spesifikaatiot, määrät, ajankohta ja täytettävät tarjouskentät. Vastaanottaja voi vastata sähköpostitse tai kevyellä vastauslomakkeella ilman uuden järjestelmän pakollista käyttöönottoa; tarkka kanava on ehdotus.

Procus tunnistaa vastauksesta puuttuvat tiedot ja valmistelee täsmennyspyynnön juuri niistä. Ostaja näkee, mistä odotetaan vastausta ja mikä tarjous on jo vertailtavissa. Muistutusten automaatio sovitaan erikseen, eikä samaa toimittajaa kuormiteta toistuvilla päällekkäisillä pyynnöillä.

Lähettämisen kanavaa ja autonomiaa ei ole vielä hyväksytty osaksi demoa. Vastauksen poimintaa ja täsmennyspyyntöä voi havainnollistaa esimerkkiviesteillä.

### F. Muuta leverage-analyysi neuvotteluvaihtoehdoiksi

Game plan kertoo, mitä neuvotteluaseman perusteella voisi tarjota tai pyytää. Esimerkiksi ostajan merkittävä osuus toimittajan liikevaihdosta voidaan yhdistää keskusteluun pidemmästä sopimuskaudesta, ennustettavammista tilausmääristä tai useampien osien keskittämisestä. Mahdolliset myönnytykset ovat ostajan arvioitavia ehdotuksia.

Vaihtoehdoissa näytetään sekä hyöty että ostajan sitoumus: mitä saadaan, mitä luvataan ja miten riippuvuus muuttuu. Vertailutarjous tukee neuvottelua vain sen todellisen voimassaolon ja käyttökelpoisuuden rajoissa.

Ask ja LAA säilyvät prosentteina. Niiden rinnalla näytetään, millä määrillä ja ehdoilla ne pätevät. Liikevaihto-osuus tai indeksimuutos ei yksin määrää prosentteja. LAA ja sisäiset myönnytysvaihtoehdot pysyvät sisäisessä game planissa.

### G. Sovita kilpailutus sen odotettuun hyötyyn

Pienessä kohteessa ensimmäinen askel voi olla olemassa olevan tarjouksen vahvistaminen, lyhyt hinnantarkistuspyyntö tai muutaman tunnetun toimittajan tarjousvertailu. Laajempaa selvitystä ehdotetaan, kun mahdollinen hyöty ja päätöksen merkitys sitä tukevat.

Priorisointi huomioi eurovaikutuksen lisäksi valmistelutyön, aikataulun ja tietojen valmiuden. Jos näitä ei tunneta numeroina, ne esitetään avoimina oletuksina tai karkeina arvioina. Tarkkaa työmäärää tai onnistumistodennäköisyyttä ei keksitä laskentaa varten.

Jatkuva seuranta ei tarkoita tarjouspyynnön lähettämistä jokaisesta hintavaihtelusta. Käynnissä olevat kilpailutukset, jo saadut käyttökelpoiset tarjoukset ja ostajan asettama uudelleentarkastelu huomioidaan ennen uuden työn ehdottamista.

### H. Näytä dashboardilla myös valmistautumisen taso

Tulosten ja säästöjen rinnalle ehdotan näkymää tulevien päätösten valmiudesta:

- Mihin lähestyviin neuvotteluihin on valmiina ajantasainen, vertailukelpoinen tarjous tai muu perusteltu vaihtoehto?
- Mistä tarjous vielä puuttuu tai vanhenee ennen päätöstä?
- Mitkä pienet sopimukset ovat päässeet käsittelyyn ja mitkä odottavat ostajan päätöstä?
- Kuinka paljon ostajan aikaa yhden kilpailutuksen valmistelu on vaatinut?

Mahdollinen mittari on niiden tulevien päätösten osuus, joihin on sovitun määritelmän mukainen valmis vaihtoehto. Aikajänne, päätösjoukko ja valmiuskriteeri näkyvät. Puuttuvia tietoja ei jätetä pois niin, että valmius näyttää todellista paremmalta. Vertailukelpoisten tarjousten määrää seurataan erikseen lähetettyjen RFQ:iden määrästä.

### Ehdotus priorisoinniksi ja demotarinaksi

Ensimmäiseksi tarkentaisin A:n, B:n ja D:n: valmistelun ajoitus, käyttökelpoinen tarjous tulevaan päätökseen ja usean osan yhteinen game plan. C tukee tätä rajatulla nykytoimittajien aineistolla. E, F, G ja H täydentävät kokonaisuutta; niiden laajuus päätetään erikseen. Aiemmin vahvistetut BOM-/indeksi- ja toimittaja-analyysin tavoitteet säilyvät.

Ehdotettu demo, kaikki luvut ja tilanteet selvästi esimerkkiaineistoa:

1. Dashboard kertoo: yhden toimittajan sopimus tulee neuvoteltavaksi kolmen kuukauden päästä, ja vertailutarjous puuttuu.
2. Ostaja avaa sopimuksen ja näkee hinnan kehityksen, kustannusvertailun, neuvotteluaseman ja samaan käsittelyyn ehdotetut osat.
3. Procus ehdottaa yrityksen nykyisestä toimittajakannasta vaihtoehtoa sekä kertoo, mikä soveltuvuudessa on jo vahvistettu ja mikä puuttuu.
4. Ostaja luo tulevalle hankintajaksolle RFQ:n sekä game planin, jossa ask on esimerkiksi 15 % ja LAA 5 %.
5. Demossa näytetään esimerkkitarjous ja tarkistetaan sen ehdot, voimassaolo ja puuttuvat vahvistukset. Tätä ei esitetä oikeasti lähetettynä tai saatuna tarjouksena.
6. Ostaja avaa nykyisen toimittajan tapaamismateriaalin, jossa vertailu on valmiina ennen neuvottelua. Dashboard näyttää valmistautumisen edenneen; säästöä ei vielä merkitä sovituksi tai toteutuneeksi.

### Tarkistettu taustatieto ja ehdotusten rajaus

Microsoft Dynamics 365:n dokumentaatio kuvaa RFQ:n lähettämisen useille toimittajille, vastausten kirjaamisen ja vertailun sekä yrityksen hyväksyttyihin hankintakategorioihin liittyvien toimittajien lisäämisen. Tämä tukee kuvausta olemassa olevista RFQ-perustoiminnoista. [Microsoft: Requests for quotation overview](https://learn.microsoft.com/en-us/dynamics365/supply-chain/procurement/request-quotations).

Procusin ennakointiin, pienten sopimusten työmäärään ja neuvotteluvalmiuteen liittyvä painotus on tämän muistion oma tuotehypoteesi. Yhden järjestelmän dokumentaatio ei osoita ominaisuuksien puuttuvan muilta tuotteilta eikä validoi kilpailuetua tai asiakkaiden maksuhalukkuutta.
