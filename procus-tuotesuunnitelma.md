# Procus — sovelluksen rakenne ja hankintojen työnkulku

Päivitetty: 19.9.2026  
Tila: yhteinen suunnitteluluonnos rakentajalle. Osio 1 kokoaa perustajan vahvistamat linjaukset. Osio 9 erottaa demon vahvistetut vaatimukset niiden toteutusehdotuksista. Osio 10 kuvaa uusimman kilpailutusta ja automaattista analyysiä koskevan tarkennuksen sekä ehdotuksen sen työnkuluksi. Muu toteutuksen yksityiskohtainen suunnittelu on ehdotusta.

Tausta: [alkuperäinen konsepti](procus.md) ja [aiemmat kehitysehdotukset](procus-kehitysehdotukset.md). Tämä dokumentti kokoaa uusimman suunnan; vanhat muistiot säilyttävät idean kehityshistorian.

## 1. Perustajan vahvistama suunta

- Yrityksen ydinidea on helpottaa hankintatyötä, saada enemmän tarjouksia ja ennen kaikkea kilpailuttaa paremmin myös pieniä sopimuksia, joihin hankintatiimin aika ei nykyisin riitä.
- Käyttäjä voi itse tarkistaa osan kilpailutustilanteen ja statuksen, hintakehityksen, BOMiin ja indekseihin sekä muihin tekijöihin perustuvan vertailun ja arvion siitä, kannattaako kilpailuttaa.
- Analyysityönkulkua ajetaan myös automaattisesti, ja sovellus nostaa esiin sopimuksia, jotka kannattaisi kilpailuttaa.
- Toimittaja-analyysi tukee neuvotteluaseman arviointia. Yksi tarkasteltava tekijä on ostajan ostojen osuus toimittajan liikevaihdosta.
- Nykyisestä toimittajakannasta pyydettävät tarjoukset ovat keskeinen lähtökohta. Toimittajan kuuluminen yrityksen toimittajakantaan ja hyväksyntä tietylle osalle erotetaan toisistaan.
- Seuranta tähtää ennakointiin: tarjous voidaan hankkia jo nyt sopimukseen, jonka uudelleenneuvottelu on esimerkiksi kolmen kuukauden päästä. Tavoitteena on saada vertailu ja vaihtoehto valmiiksi ennen päätöshetkeä.
- Sovellus avautuu dashboardiin, joka näyttää hankintojen kokonaiskuvan.
- Tuotteen painotus on tuloksissa ja hankintojen johtamisessa. Yksittäiset tuotteet ovat yksi tapa tarkastella kokonaisuutta.
- Erillisestä toimittajavälilehdestä voi tarkastella hankintoja toimittajittain.
- Erillisestä tuote-/osavälilehdestä voi tarkastella saman tuotteen eri toimittajia ja näiden osuuksia.
- Sovellukseen tulee sähköpostiyhteys, jonka kautta päivittyneet sopimukset päivittyvät tietokantaan.
- Uusia sopimuksia voi tuoda PDF-tiedostoina, ja niiden sisältö muunnetaan standardimuotoon.
- Demossa voi luoda valmiin RFQ:n tai game planin kahteen tilanteeseen: uuden toimittajan kanssa neuvottelemiseen ja nykyisen toimittajan hinnan parantamiseen.
- Neuvottelun valmisteluun kuuluvat prosentteina esitettävät ja asetettavat avauspyyntö (opening ask) ja pienin hyväksyttävä hinnanalennus (least acceptable agreement, LAA), esimerkiksi ask 15 % ja LAA 5 %.

RFQ:n ja game planin luominen näihin kahteen tilanteeseen kuuluu vahvistettuun demotavoitteeseen. Muiden toimintojen tarkkaa demolaajuutta ja keskinäistä toteutusjärjestystä ei ole vielä päätetty.

## 2. Tarkennettu tuotekäsitys

**Procus vähentää kilpailuttamisen ja neuvottelujen valmistelutyötä, jotta hankintatiimi saa enemmän tarjouksia ja pystyy kilpailuttamaan kannattavasti myös pieniä sopimuksia.**

Sama analyysi palvelee kahta käyttötapaa: ostaja tutkii itse valitsemaansa osaa tai sopimusta, tai automaattinen seuranta nostaa sen käsiteltäväksi. Molemmissa päädytään perusteltuun arvioon kilpailuttamisen tai nykytoimittajan kanssa neuvottelemisen järkevyydestä ja tarvittaessa valmiiseen RFQ:hun tai game planiin.

Käyttäjä aloittaa dashboardista kysymyksillä: miten hankinnat kehittyvät, missä on saavutettu tuloksia ja mihin pitäisi tarttua seuraavaksi? Hän voi myös hakea suoraan tietyn osan. Osan analyysi yhdistää kilpailutushistorian, hintakehityksen, kustannustekijät, toimittajavaihtoehdot ja neuvotteluaseman.

Sopimusten päivittyminen on osa tuotteen perustaa: analyysin pitää käyttää oikeaa hintaa, ehtoa ja voimassaoloaikaa. RFQ ja game plan ovat konkreettisia tuotoksia, joilla käyttäjä vie havainnon neuvotteluun. Aiempi ehdotus toimittajapaketin nostamisesta sovelluksen keskipisteeksi väistyy dashboardista alkavan käyttötavan tieltä.

## 3. Ehdotus sovelluksen navigaatioksi

| Välilehti | Käyttäjän tehtävä | Keskeinen sisältö |
| --- | --- | --- |
| Dashboard | Ymmärrä tilanne ja valitse seuraava toimenpide | Ostot, tulokset, kilpailutettaviksi nostetut sopimukset, kilpailutusten eteneminen ja saadut tarjoukset |
| Toimittajat | Johda toimittajasuhdetta ja valmistele neuvottelu | Ostot, tuotteet, sopimukset, hintakehitys, toimittaja-analyysi ja neuvotteluasema |
| Tuotteet / osat | Tarkista osan kilpailutustilanne ja toiminnan kannattavuus | Status, hintahistoria, BOM- ja indeksivertailu, toimittajat, ostojen osuudet ja kilpailutussuositus |
| Sopimukset | Tuo, tarkista ja löydä voimassa olevat ehdot | PDF-tuonti, standardoidut tiedot, alkuperäiset dokumentit ja versiot |

Kolme ensimmäistä näkymää perustuvat perustajan linjaukseen. Erillinen Sopimukset-välilehti on ehdotus; sopimusten hallinta voisi myös sijaita toimittajan alla. Sähköpostiyhteyden asetukset kuuluisivat asetuksiin ja sen tuottamat olennaiset muutokset varsinaisiin työnäkymiin.

### Dashboard: tulokset ja seuraavat päätökset

Ehdotettu sisältöjärjestys:

1. **Hankintojen tilanne:** valitun ajanjakson toteutuneet ostot ja muutos vertailukauteen, jos ostotapahtumat ovat saatavilla.
2. **Tulokset:** sovittujen muutosten laskennallinen vaikutus ja erikseen toteutuneilla ostoilla todennettu säästö.
3. **Avoin mahdollisuus:** vielä toteuttamattomien toimenpiteiden arvioitu vaikutus laskentaoletuksineen.
4. **Seuraavaksi käsiteltävät asiat:** automaattisesti kilpailutettaviksi nostetut sopimukset ja muut neuvottelukohteet. Jokainen rivi kertoo syyn, mahdollisen vaikutuksen, tiedon puutteet ja seuraavan askeleen.
5. **Viimeaikaiset muutokset:** uudet sopimusversiot, muuttuneet hinnat ja tietojen tarkistustarpeet.
6. **Kilpailutusten eteneminen:** avoimet tarjouspyynnöt, saadut tarjoukset ja vertailukelpoisten tarjousten määrä kilpailutusta kohti. Vastausta odottavat kohteet erottuvat jatkotoimia varten.

Mittarista pääsee sen muodostaviin riveihin. Ajanjakso, valuutta, laskentaperuste ja tiedon päivitysaika näytetään. Tuleva vaikutusarvio esitetään omalla aikajänteellään, vaikka ostohistoriaa tarkasteltaisiin eri ajanjaksolta.

Puuttuva data esitetään puuttuvana. Ilman ostotapahtumia sovellus ei väitä näyttävänsä toteutuneita ostoja tai säästöjä. Ensimmäisellä käyttökerralla se ohjaa tuomaan sopimuksen ja tarvittavan ostoaineiston.

### Toimittajat: yhden toimittajasuhteen kokonaisuus

Listasta voi siirtyä toimittajan omaan näkymään. Ehdotettu sisältö:

- Ostot valitulla ajanjaksolla ja toimittajan osuus yrityksen tarkasteltavista ostoista.
- Toimittajalta ostettavat tuotteet, hintakehitys ja tuotekohtaiset havainnot.
- Voimassa olevat sopimukset ja tiedossa olevat tulevat muutokset.
- Avoimet toimenpiteet, neuvottelun valmistelu ja kirjatut tulokset.
- Mahdollisuus valita useita tuotteita samaan neuvottelusuunnitelmaan.
- Toimittaja-analyysi: ostajan merkitys toimittajalle, ostajan oma riippuvuus, vaihtoehdot ja näiden vaikutus neuvotteluasemaan.

Toimittaja tarkoittaa tässä sopimus- tai myyjäosapuolta. Valmistaja voi olla eri yritys, esimerkiksi jälleenmyyjän kautta ostettaessa. Näiden samaistaminen ei ole tietomallin oletus.

### Tuotteet / osat: sama nimike eri toimittajilla

Näkymän lähtökohta on ostajan oma nimike tai osa, johon eri toimittajien vastaavat nimikkeet yhdistetään. Eri tuotteiden samankaltainen nimi ei vielä todista niiden vastaavuutta.

Yhden osan näkymässä esitetään rinnakkain toimittaja, toimittajan nimikekoodi, voimassa oleva hinta, hintayksikkö, ostettu määrä, ostojen arvo, osuus sekä olennaiset määrä- ja toimitusehdot. Hyväksyntä kyseiselle osalle ja tiedossa oleva saatavuus näytetään erikseen.

Osan näkymä vastaa myös kysymyksiin: milloin osa kilpailutettiin viimeksi, onko kilpailutus käynnissä, kuinka monta tarjousta on saatu, miten ostohinta on kehittynyt suhteessa arvioituihin kustannustekijöihin ja kannattaako käynnistää uusi toimenpide? Tarkempi työnkulku on osiossa 10.

**Ehdotus osuuksien määrittelyksi:** oletuksena näytetään toimittajan osuus kyseisen osan ostetusta määrästä. Euro-osuus on toinen erikseen nimetty mittari. Molemmat käyttävät samaa valittua ajanjaksoa ja rajattua ostoaineistoa.

- Määräosuus = toimittajalta ostettu määrä / saman osan kokonaisostomäärä yhteismitallisessa yksikössä.
- Euro-osuus = toimittajalta ostettujen rivien arvo / saman osan kaikkien ostorivien arvo yhteisessä valuutassa.
- Sopimuksessa luvattu osuus ja ostajan suunnittelema tuleva jako näytetään erillään toteutuneesta jakaumasta.
- Jos ostotietoja ei ole tai kokonaismäärä on nolla, osuutta ei lasketa. Sopimuksen olemassaolosta ei päätellä toteutuneita ostoja.

Esimerkiksi 60/40-jako tarkoittaisi toteutunutta määräjakaumaa vain, jos se voidaan laskea ostotapahtumista. Se ei sellaisenaan kerro, kuinka paljon ostoja voidaan siirtää.

## 4. Sopimusten tuonti ja standardimuoto

**Tulkinta keskusteluun:** standardimuoto tarkoittaa yhteistä tietorakennetta, jolla erilaisista sopimusdokumenteista saadaan vertailukelpoisia tietoja. Alkuperäinen PDF säilytetään lähteenä. Uuden samannäköisen PDF:n tuottamista ei ole tässä oletettu vaatimukseksi.

Ehdotetut poimittavat tiedot:

| Kokonaisuus | Esimerkkitiedot |
| --- | --- |
| Sopimuksen tunnistus | Osapuolet, sopimustunnus, dokumentin tyyppi ja versio |
| Voimassaolo | Alku- ja loppupäivä, uusiminen ja irtisanomiseen liittyvät määräajat |
| Tuote- ja hintarivit | Ostajan ja toimittajan nimikekoodit, kuvaus, hinta, valuutta, yksikkö ja määräportaat |
| Hankintaehdot | Minimimäärä, toimitusaika, toimitus- ja maksuehdot sekä mahdolliset volyymisitoumukset |
| Hinnanmuutokset | Sovittu tarkistusmenettely, indeksiehto ja muutoksen voimaantulo |
| Jäljitettävyys | Lähdedokumentti, sivu tai tekstikohta, vastaanottoaika ja tarkistustila |

Kaikkia tietoja ei löydy jokaisesta sopimuksesta. Puuttuva arvo säilyy puuttuvana, ja ristiriitainen tieto merkitään tarkistettavaksi. Yhdellä sopimuksella voi olla useita liitteitä ja hinnastoja.

Ehdotettu PDF-tuonnin kulku:

1. Ostaja lataa tiedoston. Sovellus näyttää vastaanoton ja käsittelyn etenemisen.
2. Teksti ja taulukot poimitaan; skannatusta dokumentista käytetään tarvittaessa tekstintunnistusta.
3. Sisältö muunnetaan yhteiseen rakenteeseen ja yhdistetään toimittajaan sekä nimikkeisiin.
4. Sovellus näyttää tunnistetut tiedot alkuperäisen lähteen rinnalla. Käyttäjä voi korjata tulkintoja ja ratkaista epäselvät nimikekytkennät.
5. Tiedot tallennetaan sopimusversioksi. Niiden käyttö analyysissä määräytyy tarkistus- ja voimassaolosääntöjen mukaan.

Käsittelyvirheestä pitää voida jatkaa lataamatta samaa aineistoa alusta. Sama tiedosto ei saa synnyttää toista identtistä sopimusta.

## 5. Sähköpostiyhteys ja sopimuspäivitykset

Sähköposti ja käsin ladattu PDF kulkevat saman poiminta- ja standardointiprosessin kautta. Sähköpostista säilytetään lisäksi viittaus lähdeviestiin ja liitteeseen.

Ehdotettu työnkulku:

1. Uusi viesti tai liite tunnistetaan mahdolliseksi sopimukseksi, hinnastoksi tai muutokseksi.
2. Sisältö yhdistetään oikeaan toimittajaan ja olemassa olevaan sopimukseen tai tunnistetaan uudeksi sopimukseksi.
3. Sovellus näyttää muutokset suhteessa aiempaan versioon, esimerkiksi muuttuneet tuoterivit ja uuden voimaantulopäivän.
4. Muutos tallentuu tietokantaan. Sen tila erottaa vastaanotetun aineiston, tarkistetun tulkinnan ja hankinnoissa sovellettavan ehdon.
5. Käyttöön tullut muutos päivittää siihen liittyvät näkymät, havainnot ja vaikutusarviot.

**Avoin päätös:** saako tunnistettu päivitys tulla suoraan analyysin käyttämäksi ehdoksi vai vahvistaako ostaja sen ensin? Ehdotus ensimmäiseen versioon on automaattinen poiminta ja tallennus sekä käyttäjän vahvistus ennen uuden ehdon käyttöönottoa. Tämä on ehdotus, ei perustajan vahvistama vaatimus.

Tarjous, neuvotteluluonnos, hinnankorotusilmoitus ja hyväksytty sopimus ovat eri tietoja. Uusin saapunut viesti ei automaattisesti tarkoita uusinta voimassa olevaa ehtoa. Tulevaisuudessa voimaan astuva hinta säilyy erillään nykyhinnasta.

Ensimmäistä sähköpostipalvelua, seurattavaa postilaatikkoa tai kansiota ja vanhojen viestien tuonnin laajuutta ei ole valittu. Sähköpostiyhteydelle on toistaiseksi kuvattu lukemisen käyttötapaus; viestien lähettämisestä päätetään erikseen.

## 6. Tekniset seuraukset rakentajalle

Seuraavat ovat ehdotuksia tietojen ja käsittelyn rakenteeksi, eivät teknologiavalintoja.

- **Yhteiset ydintiedot:** toimittaja, ostajan nimike, toimittajan nimike, niiden vastaavuus, sopimus, sopimusversio, hinta-/ehtorivi ja ostotapahtuma.
- **Työnkulun tiedot:** analyysiajo, havainto, kilpailutus, kilpailutusrivi, pyynnön vastaanottaja, tarjous ja tarjousrivi, toimenpide, neuvottelutavoite ja kirjattu lopputulos. Yksi kilpailutus voi koskea useita osia ja useita toimittajia; tarjoukset yhdistetään oikeisiin riveihin.
- **Analyysin lähtötiedot:** osan BOM ja sen versio, kustannusosuudet, indeksisarjat päivämäärineen, muut perustellut kustannustekijät sekä toimittajan liikevaihtotieto lähteineen ja tilikausineen. Näiden saatavuutta ei ole vielä vahvistettu.
- **Hinnan merkitys:** sopimushinta, tarjoushinta, laskutettu hinta ja ehdotettu tavoite tallennetaan toisistaan erotettavina tietoina.
- **Ajallinen historia:** tiedon vastaanottoaika ja ehdon voimassaoloaika ovat eri asioita. Uusi versio ei hävitä aiempaa versiota.
- **Lähteet:** tulkitusta ehdosta pitää päästä dokumenttiin tai viestiin, josta se on poimittu. Viestin sisältö käsitellään aineistona, ei järjestelmän toimintaohjeena.
- **Taustakäsittely:** sähköpostien ja PDF:ien käsittelyllä on näkyvä tila, uudelleenyritys ja päällekkäisyyksien tunnistus. Uudelleenyritys ei saa kertoa samoja sopimuksia tai vaikutuksia.
- **Laskenta:** hinnat ja osuudet lasketaan määritellyillä säännöillä. AI voi tulkita ja selittää, mutta puuttuvia numeroita tai sopimusehtoja ei täydennetä arvauksilla.
- **Asiakasyritysten tiedot:** käyttöoikeudet, yrityskohtaisten tietojen erottelu, sähköpostiyhteyden tunnisteiden suojaus ja muutoshistoria määritellään ennen oikean asiakasdatan käyttöönottoa.

Sopimusaineisto kertoo ehdot. Toteutuneet hankinnat ja toimittajaosuudet tarvitsevat lisäksi ostotapahtumat esimerkiksi ERP:stä, laskuaineistosta tai erikseen tuotavasta tiedostosta. Tätä datalähdettä ei ole vielä päätetty.

## 7. Päätettävät kysymykset seuraavaksi

| Kysymys | Miksi se vaikuttaa toteutukseen? |
| --- | --- |
| Mitkä kolme asiaa käyttäjän pitää nähdä dashboardista heti? | Määrittää etusivun painotuksen ja tärkeimmät laskennat. |
| Mistä toteutuneet ostot ja määrät saadaan? | Ratkaisee, voidaanko näyttää toteutuneita osuuksia, spendiä ja säästöjä. |
| Mistä BOMit, kustannusosuudet, indeksit ja toimittajien liikevaihtotiedot saadaan? | Ratkaisee, millaiset kustannus- ja neuvotteluaseman arviot voidaan perustella. |
| Mikä käynnistää automaattisen analyysin ja millä perusteella kohde nostetaan käsittelyyn? | Määrittää seurannan rytmin, priorisoinnin ja sen, ettei sama havainto synnytä toistuvia tehtäviä. |
| Miten tarjouspyyntöjen vastaanottajat valitaan ja saadut tarjoukset tuodaan vertailuun? | Yhdistää valmistelun tavoitteeseen saada enemmän käyttökelpoisia tarjouksia. |
| Tarkoittaako standardimuoto rakenteista tietoa, yhdenmukaista dokumenttia vai molempia? | Erottaa tiedon poiminnan dokumentin uudelleenmuotoilusta. |
| Vahvistaako ostaja uudet sopimusehdot ennen niiden käyttöä? | Määrittää päivityksen työnkulun ja käyttöoikeudet. |
| Miten osat tunnistetaan eri toimittajien dokumenteista? | Ratkaisee, milloin hinnat ja osuudet voidaan yhdistää samaan näkymään. |
| Mikä sähköpostipalvelu ja minkä rajauksen viestit yhdistetään ensin? | Rajaa integraation sekä alkuperäisen aineiston tuonnin. |
| Mikä on säästön sovittu vertailuperuste ja aikajänne? | Tekee dashboardin tuloksista ymmärrettäviä ja estää saman hyödyn laskemisen kahdesti. |
| Miten Procus ehdottaa opening askin ja least acceptable agreementin, ja mitä ostaja vahvistaa? | Ratkaisee neuvottelusuunnitelman tietovaatimukset ja tavoitteen asettamisen työnkulun. |
| Miten valmis RFQ tai game plan otetaan käyttöön sovelluksen ulkopuolella? | Rajaa kopioinnin, tiedostoviennin ja mahdollisen myöhemmän lähettämisen. |
| Mitkä osat ovat ensimmäisessä demossa oikeaa käsittelyä ja mitkä esimerkkiaineistoa? | Antaa rakentajalle konkreettisen ensimmäisen toimituksen. |

## 8. Ehdotus ensimmäiseksi läpikäytäväksi käyttäjäpoluksi

Ostaja tuo yhden toimittajan sopimuksen PDF:nä, tarkistaa sen standardoidut tiedot ja näkee ne toimittajan sekä osan näkymässä. Jos saman osan ostotietoja on tuotu, myös toimittajien toteutuneet osuudet näkyvät. Sähköpostiin saapuva päivitys tunnistetaan saman sopimuksen uudeksi versioksi. Sovellus näyttää muuttuneet ehdot, niiden voimaantulon ja laskettavissa olevan vaikutuksen dashboardissa.

Tämän jälkeen ostaja siirtyy jompaankumpaan osion 9 neuvottelupolkuun ja luo valmiin valmistelumateriaalin. Mahdollinen, sovittu ja toteutunut vaikutus säilyvät erillisinä. Sopimuksen tuonnista alkava kokonaispolku on ehdotus; molempien neuvottelutilanteiden tukeminen demossa on vahvistettu.

## 9. Demon RFQ ja game plan

### Vahvistettu tavoite

Demossa käyttäjä voi luoda valmiin RFQ:n tai game planin, kun hän haluaa:

1. Neuvotella uuden toimittajan kanssa.
2. Parantaa hintaa nykyisen toimittajan kanssa.

Neuvottelun valmisteluun sisältyvät opening ask ja least acceptable agreement prosentteina. Prosentit ovat ensisijaiset tavoitekentät; niitä vastaavat yksikköhinnat ja eurovaikutukset ovat laskettuja tukitietoja. Pelkkä mahdollisuuden näyttäminen tai yleinen neuvo neuvotella ei täytä tätä demotavoitetta.

### Ehdotus kahden polun tuotoksiksi

| Tilanne | Toimittajalle tarkoitettu materiaali | Ostajan sisäinen game plan |
| --- | --- | --- |
| Uusi toimittaja | RFQ: osat ja spesifikaatiot, pyydettävät määrät tai määräportaat, toimitustarve, olennaiset ehdot, vastauksen määräaika ja tarjouksessa ilmoitettavat tiedot | Avauspyyntö, hyväksyttävän lopputuloksen raja, tavoitteiden perusteet, uuden toimittajan soveltuvuuden tarkistukset ja vaihtoehto, jos sopimusta ei synny |
| Nykyisen toimittajan hinnan parantaminen | Hinnantarkistuspyyntö: valitut osat, nykyinen hinta, avauspyyntö, jaettavaksi soveltuvat perustelut ja pyydetty voimaantulo | Avauspyyntö, hyväksyttävän lopputuloksen raja, neuvottelun eteneminen, mahdolliset myönnytykset ja vaihtoehto, jos riittävää parannusta ei saavuteta |

RFQ on toimittajalle tarkoitettu tarjouspyyntö. Game plan on ostajan sisäinen suunnitelma. Ehdotus on valmistella molemmille poluille sisäinen suunnitelma ja siitä erillinen toimittajaversio. Tämä tuotosten tarkka yhdistelmä ei ole vielä erikseen vahvistettu.

Uuden toimittajan voi demossa valita tunnetuista ehdokkaista tai syöttää käsin. Uusien toimittajien automaattista hakua ei ole tämän vaatimuksen perusteella oletettu pakolliseksi. Uusi ehdokas ei vielä ole osalle hyväksytty toimittaja.

### Opening ask ja least acceptable agreement

- **Opening ask (%):** ensimmäisenä pyydettävä hinnanalennus nimetystä vertailuhinnasta, esimerkiksi 15 %.
- **Least acceptable agreement / LAA (%):** pienin hyväksyttävä hinnanalennus samasta vertailuhinnasta, esimerkiksi 5 %. Tämä on ostajan sisäinen hyväksymisraja.
- **Muut välttämättömät ehdot:** esimerkiksi laatu, toimitusaika ja minimimäärä. Hintarajan täyttyminen ei yksin tee tarjouksesta hyväksyttävää, jos nämä ehdot eivät täyty.

Havainnollistava esimerkki nykytoimittajasta: **ask 15 %, LAA 5 %**. Nykyhinnalla 10,00 €/kpl sovellus näyttää tukitietona avauspyyntöä vastaavan hinnan 8,50 €/kpl ja hyväksymisrajaa vastaavan hinnan 9,50 €/kpl samoilla ehdoilla. Prosenttiluvut ovat demo-esimerkki, eivät kaikkien neuvottelujen kiinteät oletusarvot.

Lasketut hinnat: avauspyynnön hinta = vertailuhinta × (1 − ask / 100); hyväksymisrajan hinta = vertailuhinta × (1 − LAA / 100). Eurovaikutus tarvitsee lisäksi määritellyn määrän ja aikajänteen.

Uuden toimittajan kohdalla prosenttien vertailuperuste voi olla nykyisen toimittajan vertailukelpoinen hinta tai muu perusteltu vertailu. Molemmat prosentit lasketaan samasta näkyviin nimetystä perusteesta. Jos vertailuhinta puuttuu, prosenttitavoitteet voidaan kirjata alustavasti, mutta sovellus pyytää vertailuperusteen ennen hintojen laskemista ja materiaalin merkitsemistä valmiiksi.

**Ehdotettu tavoitteen asettaminen:** Procus ehdottaa ask- ja LAA-prosentteja saatavilla olevien hintojen, ehtojen ja vaihtoehtojen perusteella. Se näyttää perustelut ja oletukset. Ostaja voi muokata ja vahvistaa prosentit. Jos tietopohja ei riitä, sovellus pyytää ostajalta tavoitteen ja merkitsee sen ostajan asettamaksi.

Hyväksymisraja, sisäiset myönnytykset ja neuvottelun varasuunnitelma eivät siirry toimittajaversioon. RFQ:hun voidaan sisällyttää ostajan valitsema avauspyyntö; hyväksymisraja pysyy aina sisäisessä suunnitelmassa. Myös muiden toimittajien nimet ja luottamukselliset tarjousaineistot rajataan toimittajaversion ulkopuolelle oletuksena.

### Ehdotus käyttöliittymän kuluksi

1. Ostaja aloittaa dashboardin toimenpiteestä, toimittajan näkymästä tai osan toimittajavertailusta painikkeella **Valmistele neuvottelu**.
2. Hän valitsee **Uusi toimittaja** tai **Paranna nykyistä hintaa**.
3. Hän tarkistaa mukaan otettavat osat, määrät, ehdot ja vastapuolen. Tunnetut tiedot ovat valmiiksi täytettyinä.
4. Procus näyttää muokattavat **Ask (%)**- ja **LAA (%)** -kentät sekä niiden perustelut ja yhteisen vertailuhinnan. Ostaja tarkistaa prosenttitavoitteet; vastaavat yksikköhinnat ja laskettavissa olevat eurovaikutukset päivittyvät automaattisesti.
5. **Luo valmistelumateriaali** tuottaa muokattavan sisäisen game planin ja polkuun sopivan toimittajaversion omiin näkymiinsä.
6. Ostaja voi tallentaa ja kopioida valmiin materiaalin. Tiedostoviennin formaatti on avoin päätös. Automaattinen sähköpostilähetys ei seuraa materiaalin luomisesta.

RFQ esittää määrät ennusteina tai tarjouspyynnön määrinä, ellei ostaja nimenomaisesti vahvista ostositoumusta. Lopullinen tarjous on toimittajalta pyydettävä tieto, joten sitä ei tarvitse tuntea RFQ:ta luotaessa. Sen sijaan puuttuva olennainen spesifikaatio tai ostajan määriteltävä toimitustarve merkitään täydennettäväksi ennen materiaalin merkitsemistä valmiiksi.

Game plan sisältää lähtötilanteen, tavoitteen, avauspyynnön, hyväksymisrajan, argumentit lähteineen, käsiteltävät kysymykset, ehdotetun etenemisen ja vaihtoehdon epäonnistumisen varalle. Se huomioi valitut osat ja juuri kyseisen toimittajatilanteen.

### Ehdotus tekniseksi toteutussopimukseksi

- Tallennetaan neuvottelun tyyppi, vastapuoli, valitut nimikkeet, määrät, yksiköt, valuutta, aikajänne, vertailuperuste ja niiden lähteet.
- Avauspyyntö ja hyväksymisraja tallennetaan nimikkeittäin prosentteina, esimerkiksi `opening_ask_pct: 15` ja `laa_pct: 5`, yhdessä vertailuhinnan ja sen lähteen kanssa. Yksikköhinnat johdetaan näistä. Usean osan paketin yhteenveto lasketaan rivikohtaisista eurovaikutuksista; prosentteja ei summata eikä oteta niiden painottamatonta keskiarvoa.
- Hinnanalennuksessa ask-prosentin on oltava vähintään LAA-prosentin suuruinen. Ehdotettu hintaneuvottelun validointi on `0 ≤ LAA ≤ ask < 100`, ja laskennassa käytettävän vertailuhinnan on oltava positiivinen. Ristiriitaiset arvot näytetään käyttäjälle korjattaviksi.
- Sisäinen suunnitelma ja toimittajalle tarkoitettu materiaali käsitellään erillisinä tuotoksina. Toimittajaversion kopiointi ja vienti käyttävät vain siihen sallittuja tietoja; pelkkä sisäisen kentän piilottaminen näytöltä ei riitä.
- Tallennetaan, mihin sopimus- ja hintaversioon suunnitelma perustuu. Jos lähdetiedot muuttuvat, suunnitelma merkitään tarkistettavaksi. Käyttäjän omia muokkauksia ei korvata hiljaisesti uudella generoinnilla.
- Materiaalin luominen tai avauspyynnön vahvistaminen ei kirjaa säästöä sovituksi. Samalle volyymille laaditut uuden ja nykyisen toimittajan vaihtoehdot eivät kerrytä kahta säästöä.

### Ehdotetut demon hyväksymiskriteerit

1. Molemmat neuvottelutilanteet voi viedä valinnasta valmiiseen, muokattavaan tuotokseen esimerkkiaineistolla.
2. Tuotos sisältää valitut osat, määrät ja tilanteeseen sopivat ehdot. Uuden toimittajan RFQ:ssa on riittävät tiedot tarjouksen pyytämiseksi; nykytoimittajan materiaalissa on yksilöity hinnanparannuspyyntö.
3. Sisäinen game plan näyttää askin ja LAA:n prosentteina perusteluineen. Kun vertailuhinta on 10,00 €/kpl, ask 15 % tuottaa lasketun hinnan 8,50 €/kpl ja LAA 5 % hinnan 9,50 €/kpl. Ostajan muuttama prosentti päivittää lasketut hinnat ja vaikutukset. Ask 5 % ja LAA 15 % merkitään ristiriitaiseksi.
4. Toimittajaversion esikatselu ja kopioitu tai viety sisältö eivät sisällä hyväksymisrajaa tai sisäistä neuvottelutaktiikkaa.
5. Olennaiset puuttuvat tiedot näkyvät täydennettävinä, ja fiktiivinen demoaineisto on merkitty selvästi. Sovellus ei keksi tarjousta, kapasiteettia tai hyväksyntää.
6. Valmistelumateriaali voidaan tallentaa ja avata uudelleen. Generointi ei lähetä viestiä, hyväksy tarjousta eikä muuta dashboardin sovittuja tai toteutuneita säästöjä.

## 10. Kilpailuttaminen ja automaattinen analyysi

### Vahvistettu tuotetavoite ja demorajaus

Pienten sopimusten kilpailuttaminen, useampien tarjousten saaminen, käyttäjän itse avaama osan analyysi, automaattiset kilpailutusehdotukset sekä kustannus- ja toimittaja-analyysi kuuluvat perustajan kuvaamaan tuotteen ytimeen. BOM-/indeksivertailua ja neuvotteluasemaa ei tämän tarkennuksen jälkeen käsitellä pelkkinä mahdollisina lisäideoina.

Niiden tekninen toteutustapa, todelliset datalähteet ja automaation laajuus ensimmäisessä demossa ovat vielä avoimia. Osion 9 RFQ- ja game plan -toiminnot säilyvät vahvistettuina demovaatimuksina. Alla oleva yksityiskohtainen työnkulku on toteutusehdotus.

### Käyttäjän käynnistämä tarkastelu

1. Ostaja hakee osan ja avaa sen näkymän dashboardista tai Tuotteet / osat -välilehdeltä.
2. Hän näkee kilpailutustilanteen: viimeisin tiedossa oleva kilpailutus, käynnissä oleva käsittely, vastaanottajat, saadut tarjoukset, seuraava askel ja vastuuhenkilö. Jos historiaa ei ole tuotu, näkymä kertoo sen; puuttuva historia ei tarkoita, ettei osaa ole koskaan kilpailutettu.
3. Hän tarkastelee nykyistä hintaa ja hintahistoriaa. Vertailussa erotellaan sopimushinnat, tarjoukset ja toteutuneet ostohinnat sekä olennaiset muutokset määrissä, yksiköissä ja ehdoissa.
4. Hän avaa kustannusvertailun: BOMiin liitetyt materiaalit, soveltuvat indeksit, arvioidut kustannusosuudet ja muut tunnetut hintaan vaikuttavat tekijät. Näkymä kertoo, mitä vertailu selittää ja mitä se ei kata.
5. Hän tarkistaa toimittajien tilanteen: vaihtoehdot, nykyinen ostojakauma, hyväksynnät, saatavuus ja neuvotteluaseman perusteet.
6. Procus esittää perustellun seuraavan toimenpiteen. Ehdotetut vaihtoehdot ovat **Kilpailuta**, **Neuvottele nykyisen kanssa**, **Selvitä ensin** ja **Jatka seurantaa**.
7. Ostaja käynnistää kilpailutuksen tai neuvottelun valmistelun. Jo avoinna olevan asian kohdalla hän jatkaa olemassa olevaa työnkulkua.

### Sama tarkastelu automaattisesti

Ehdotettu taustakulku:

1. Uusi sopimus, hinnasto, ostoaineisto tai olennainen analyysin lähtötieto käynnistää siihen liittyvien kohteiden uudelleenarvioinnin. Ajastettu ajo tarkistaa myös lähestyvät sopimus- ja päätösajankohdat. Ajotiheys on avoin.
2. Järjestelmä tekee saman hinta-, kustannus-, vaihtoehto- ja toimittaja-analyysin, jonka ostaja näkee osan näkymässä.
3. Se arvioi toimenpiteen ajankohtaisuuden ja mahdollisen hyödyn suhteessa valmistelutyöhön, toimittajan hyväksyntään, vaihtokustannuksiin ja sopimusrajoitteisiin siltä osin kuin ne tunnetaan.
4. Perusteltu kohde nostetaan dashboardiin. Nosto sisältää sopimuksen ja siihen liittyvät osat, syyn, tietolähteet, vaikutusarvion oletuksineen ja ehdotetun seuraavan askeleen.
5. Ostaja avaa noston, tarkistaa perusteet ja vie asian RFQ:n tai game planin valmisteluun. Tarvittaessa saman toimittajan pieniä kohteita yhdistetään yhteen käsittelyyn.

Sama muuttumaton havainto ei synnytä jokaisessa ajossa uutta tehtävää. Avoin kilpailutus, käyttäjän kirjaama päätös ja sovittu uudelleentarkastelu huomioidaan. Olennainen uusi tieto päivittää havaintoa ja näyttää, mikä muuttui.

Automaattinen arviointi ja flägaaminen ovat vahvistettua tuotesuuntaa. Tarjouspyyntöjen automaattinen lähettäminen, neuvottelu tai ostojen siirtäminen vaativat erillisen tuotevalinnan; nykyinen määrittely ei päätä niitä.

### Millä perusteella kilpailuttamista suositellaan?

Suositus yhdistää useita perusteluja. Suosituksen tarkkaa laskentasääntöä tai kynnysarvoja ei ole päätetty.

| Tarkastelu | Mitä ostajan pitää ymmärtää? |
| --- | --- |
| Kilpailutushistoria ja tarjoukset | Onko ajantasaisia, vertailukelpoisia tarjouksia riittävästi päätöksen tueksi? |
| Hintakehitys | Mikä hinnassa on muuttunut, milloin ja millä ostoilla sillä on merkitystä? |
| Kustannuskehitys | Antavatko BOM, indeksit ja muut tiedot syyn kyseenalaistaa hintatasoa tai sen muutosta? |
| Vaihtoehdot | Keiltä tarjous kannattaa pyytää, ja mitä hyväksynnästä tai toimituskyvystä vielä puuttuu? |
| Neuvotteluasema | Kuinka tärkeitä ostaja ja toimittaja ovat toisilleen, ja mitkä vaihtoehdot ovat uskottavia? |
| Hyöty ja työmäärä | Onko arvioitu hyöty riittävä suhteessa kilpailutuksen ja mahdollisen vaihdon työhön ja kustannuksiin? |
| Ajankohta | Voidaanko toimia ennen seuraavaa tilausta, hinnantarkistusta tai sopimuksen uusimista? |

Puuttuva tieto voi johtaa suositukseen selvittää asia ensin. Euromääräistä nettohyötyä ei väitetä tunnetuksi, jos olennaisia kustannuksia ei tunneta. RFQ:n pyytäminen voi itsessään olla perusteltu tapa hankkia puuttuva ajantasainen vertailuhinta.

### BOM- ja indeksivertailun esittäminen

Osan näkymässä esitetään ostohinnan kehitys ja perusteltu kustannuskehityksen vertailu. Indeksin pistelukua ei esitetä suoraan osan eurohintana. Yhteistä kuvaajaa varten sarjat voidaan normalisoida samaan lähtöajankohtaan; laskennassa käytettävät absoluuttiset hinnat säilyvät erillään.

BOM kertoo rakenteesta ja materiaalimääristä. Kustannusvaikutuksen laskeminen tarvitsee lisäksi perusteen kustannusosuuksille, soveltuville indekseille ja mahdollisille viiveille. Materiaalin paino-osuus ei automaattisesti ole sen osuus ostohinnasta.

Havainnollistava oletus: jos yhden materiaalin osuus lähtötilanteen kustannuksista on 40 % ja sen indeksi laskee 10 %, tämän tekijän laskennallinen vaikutus kokonaiskustannukseen on −4 %, muiden tekijöiden pysyessä samoina. Tämä ei vielä todista 4 %:n hinnanalennuksen olevan saatavilla eikä aseta automaattisesti askia tai LAA:ta.

Sopimukseen kirjatun indeksikaavan noudattamisen tarkistus erotetaan oletuksiin perustuvasta kustannusarviosta. Jos BOM tai kustannusosuudet puuttuvat, käytettävissä olevan indeksin kehitys voidaan näyttää taustatietona ilman väitettä osan perustellusta hinnasta.

### Toimittaja-analyysi ja neuvotteluasema

Yksi tunnusluku on **ostajan ostot toimittajalta / toimittajan liikevaihto samalla ajanjaksolla**. Se kertoo arviosta ostajan merkityksestä toimittajalle. Tämä on eri luku kuin toimittajan osuus ostajan omista hankinnoista tai tietyn osan ostomäärästä.

Laskenta tarvitsee oikean sopimusosapuolen, vertailukelpoisen ajanjakson ja valuutan sekä tiedon siitä, koskeeko liikevaihto kyseistä yhtiötä vai konsernia. Lähde ja tietojen ikä näytetään. Jos käytetään eri ajanjaksoja tai arviota, suhdeluku nimetään arvioksi ja sen rajaus kerrotaan.

Suuri liikevaihto-osuus on mahdollinen argumentti neuvotteluasemasta. Sen rinnalla tarkastellaan ostajan omaa riippuvuutta: vaihtoehtoisten toimittajien hyväksyntää, kapasiteettia, siirtymisaikaa ja vaihtokustannuksia. Tunnusluku ei yksin tuota tiettyä ask- tai LAA-prosenttia.

### Kilpailutuksen eteneminen ja enemmän tarjouksia

Kilpailutus on oma kokonaisuutensa, johon liittyy yksi tai useampi osa ja yksi tai useampi tarjouspyynnön vastaanottaja. Saman osan nykyinen toimittaja voi osallistua kilpailutukseen uusien ehdokkaiden rinnalla. Pelkkä nykytoimittajan hinnanparannusneuvottelu on myös mahdollinen erillinen toimenpide.

Ehdotetut kilpailutuksen vaiheet ovat **Valmistelu → Tarjouksia odotetaan → Tarjousten vertailu → Neuvottelu tarvittaessa → Päätetty → Toteutumisen seuranta**. Havainto ennen kilpailutuksen avaamista on erillinen tieto. Kilpailutus voidaan myös keskeyttää tai siirtää myöhemmäksi kirjatulla syyllä.

Tarjousta odottavaan tilaan siirrytään vasta, kun lähettäminen on vahvistettu integraatiosta tai käyttäjä on kirjannut lähetyksen. Vastaanottajakohtaisesti seurataan, keneltä vastaus puuttuu. Tarjouksista erotetaan saapuneet ja aidosti vertailukelpoiset tarjoukset; saman tarjouksen korjattu versio ei kasvata erillisten tarjoajien määrää.

Tarjousten vertailussa huomioidaan hinnan lisäksi määräportaat, toimitus- ja maksuehdot, lisäkustannukset ja vaatimusten täyttyminen. Osan näkymässä näytetään siihen liittyvät kilpailutukset ja niiden rivikohtainen tilanne; koko paketin päätös ei automaattisesti tarkoita, että jokaisesta osasta on sovittu.

Tarjouspyyntöjen lähettämisen ja tarjousten vastaanoton kanavat ovat avoimia. Ehdotus on hyödyntää myöhemmin sähköpostiyhteyttä myös tarjousten tunnistamiseen. Demossa lähetys ja saadut tarjoukset voidaan tarvittaessa kirjata käyttäjän toimesta ilman lähetysintegraatiota; tämä demorajaus on vielä ehdotus.

Arvon seurannan ehdotukset: kilpailutettujen pienten sopimusten määrä ja kattavuus sovitussa hankintajoukossa, vertailukelpoisten tarjousten määrä kilpailutusta kohti, ostajan käyttämä valmisteluaika sekä sovittu ja toteutunut taloudellinen vaikutus. Pienen sopimuksen tarkkaa euromääräistä rajaa ja mittarien tavoitetasoja ei ole vielä päätetty.

## 11. Whiteboardin pohjalta jatkettava suunnittelu

Perustajan whiteboard yhdistää ostajan työtilan, tarjoukset nykyisestä toimittajakannasta, hankinnan kustannukset, vähän jalostetut tuotteet tai suuren nimikemäärän toimittajaa kohti, toimittajien nostot, tapaamisten game planit, pienet vähälle huomiolle jäävät toimittajasuhteet, neuvotteluaseman analyysin ja jatkuvan ennakoinnin.

Kolmen kuukauden päähän valmistautuminen on esimerkki ennakoinnin tarpeesta, ei kaikille sopimuksille asetettu kiinteä seurantaraja. Seurannan tavoitetta kuvataan lähes reaaliaikaiseksi suhteessa kvartaalittaiseen tarkasteluun; todellinen päivitysrytmi riippuu datalähteistä eikä reaaliaikaista saatavuutta ole vahvistettu.

Tämän pohjalta laaditut uudet tuote-ehdotukset, priorisointi ja esimerkkidemo ovat [kehitysehdotusten osiossa 9](procus-kehitysehdotukset.md#9-whiteboardin-pohjalta-ehdotetut-parannukset). Ne eivät vielä muuta demon vahvistettua laajuutta.
