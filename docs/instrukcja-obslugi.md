# Satyryk — instrukcja obsługi

Satyryk to notatnik dla komików: przechowuje Twoje żarty wraz z historią wersji
i pozwala budować z nich setlisty na występy. Aplikacja działa w przeglądarce,
a wszystkie dane zapisuje **lokalnie na Twoim urządzeniu** (localStorage) —
nic nie jest wysyłane na żaden serwer.

---

## Spis treści

1. [Pierwsze kroki](#pierwsze-kroki)
2. [Żarty](#żarty)
3. [Edytor żartu](#edytor-żartu)
4. [Wersje i drzewo wersji](#wersje-i-drzewo-wersji)
5. [Komentarze do tekstu](#komentarze-do-tekstu)
6. [Reakcje](#reakcje)
7. [Setlisty](#setlisty)
8. [Tryb sceniczny i wydruk](#tryb-sceniczny-i-wydruk)
9. [Import i eksport (kopie zapasowe)](#import-i-eksport-kopie-zapasowe)
10. [Język i skróty](#język-i-skróty)
11. [Gdzie są moje dane?](#gdzie-są-moje-dane)

---

## Pierwsze kroki

Po otwarciu aplikacji zobaczysz u góry pasek z dwiema zakładkami: **Żarty**
i **Setlisty**, a po prawej przełącznik języka **PL / EN**.

Jeśli zaczynasz od zera, kliknij **„Wczytaj demo"** — aplikacja doda przykładowy
zestaw żartów i setlist, żebyś mógł się rozejrzeć. Demo możesz w każdej chwili
usunąć (patrz: [Usuń wszystko](#import-i-eksport-kopie-zapasowe)).

---

## Żarty

Zakładka **Żarty** to Twoja biblioteka materiału. Każdy żart wyświetla się jako
kafelek z tytułem, statusem, liczbą wersji i tagami.

**Wyszukiwanie i filtry:**
- Pole wyszukiwania filtruje żarty po tytule.
- Przyciski filtra pokazują żarty według statusu. Statusy i ich znaczenie:

| Status | Znaczenie |
|--------|-----------|
| **pomysł** (idea) | luźny pomysł, jeszcze nie napisany |
| **szkic** (draft) | pierwsza wersja tekstu |
| **w pracy** (working) | rozpracowywany, testowany |
| **dopracowany** (polished) | gotowy na scenę |
| **emerytowany** (retired) | już nieużywany |

**Tworzenie żartu:** kliknij **„Nowy żart"** (na telefonie — okrągły przycisk **+**
w prawym dolnym rogu).

---

## Edytor żartu

Kliknięcie w kafelek żartu otwiera edytor. Znajdziesz tu:

- **Tytuł** — kliknij i pisz.
- **Status** — kliknij jeden z kolorowych przycisków, żeby go ustawić.
- **Tagi** — wpisz oddzielone przecinkami (np. `praca, rodzina, absurd`).
- **Wersje** — zakładki z kolejnymi wersjami tekstu (patrz niżej).
- **Tekst** — właściwa treść wybranej wersji.
- **Notatki** — Twoje uwagi do wersji (kursywą, nie są częścią żartu).
- **Czas (⏱)** — szacowany czas trwania wersji, np. `2:30` (min:sek) lub `3`
  (traktowane jako minuty). Wykorzystywany później do liczenia długości setlisty.

**Zapis jest automatyczny** — nie ma przycisku „Zapisz", każda zmiana trafia
od razu do pamięci.

**Cofanie zmian:** przyciski **Cofnij / Ponów** u góry (lub skrót `Ctrl+Z` /
`Ctrl+Shift+Z`). Historia obejmuje do 50 ostatnich kroków.

**Usuwanie żartu:** przycisk **Usuń** u góry (z potwierdzeniem).

---

## Wersje i drzewo wersji

To serce Satyryka. Każdy żart może mieć wiele wersji tekstu.

- **Dodaj wersję** (`+`) — tworzy nową, pustą wersję.
- **Rozgałęź** (branch) — tworzy nową wersję **skopiowaną z bieżącej**
  i połączoną z nią jako „dziecko". Dzięki temu możesz wypróbować alternatywny
  punchline, nie tracąc oryginału.
- **Etykieta** — każdą wersję możesz nazwać (domyślnie `v1`, `v2`...).
- **Usuń wersję** — jeśli usuniesz wersję, która miała rozgałęzienia, jej
  „dzieci" zostaną podpięte pod jej rodzica (nic nie osieroci się w drzewie).

**Widok drzewa** (przycisk ⎇ **Pokaż drzewo**) pokazuje strukturę rozgałęzień —
widać, która wersja z której wyrosła. Klikając węzeł, przeskakujesz do tej wersji.

---

## Komentarze do tekstu

W polu tekstu wersji **zaznacz fragment** — pojawi się przycisk **💬 Dodaj komentarz**.
Wpisz uwagę (np. „skrócić", „mocniejsze słowo") i zatwierdź (Enter).

- Skomentowane fragmenty są **podświetlone na żółto** w tekście.
- Wszystkie komentarze wyświetlają się listą pod polem tekstu.
- Komentarz usuwasz przyciskiem **✕** przy nim.

To działa jak komentarze w edytorach dokumentów, ale dopięte do konkretnego
miejsca w konkretnej wersji żartu.

---

## Reakcje

Nad tekstem każdej wersji jest rząd emoji-reakcji (domyślnie 🔥 💀 😂 🤔 ❌ 👌).
Kliknij, żeby oznaczyć wersję — przydaje się do szybkiej oceny („ta zawsze łapie").

Zestaw emoji możesz zmienić: kliknij ikonę ołówka **✎** obok reakcji i wpisz
własne emoji oddzielone spacjami. Zmiana dotyczy całej aplikacji.

---

## Setlisty

Zakładka **Setlisty** służy do układania materiału na konkretny występ.

1. Kliknij **„Nowa setlista"** i nadaj jej tytuł.
2. Ustaw opcjonalnie **czas występu** (🎤, np. slot „20 min").
3. Z panelu **„Dodaj żarty"** po prawej klikaj żarty, żeby dodać je do listy.
   Panel ma własne wyszukiwanie i filtr statusów.
4. Dla każdego żartu wybierz, **którą wersję** zagrasz (jeśli ma ich kilka).
5. **Przejścia (segues):** przyciskiem **„Dodaj przejście"** wstawiasz między
   żarty notatkę pomostową (np. „nawiązać do poprzedniego tematu").
6. Kolejność zmieniasz strzałkami **▲ / ▼**, usuwasz elementy przyciskiem **✕**.

**Sumowanie czasu:** jeśli wszystkie żarty w setliście mają uzupełniony czas,
Satyryk pokaże łączny czas (`~`). Jeśli któremuś czasu brakuje — pokaże `?`.

Kliknięcie w żart na liście rozwija jego podgląd; stąd możesz też przeskoczyć
do edycji tego żartu.

---

## Tryb sceniczny i wydruk

W setliście masz dwa dodatkowe widoki:

- **Karty** — żarty jako kafelki; kliknięcie otwiera podgląd pełnego tekstu.
  Dobre do szybkiego przeglądania przed występem.
- **Pełny tekst** — cała setlista jako ciągły tekst do czytania, po kolei.

Z widoku pełnego tekstu możesz kliknąć **„Drukuj / PDF"**. W oknie wydruku wybierasz:
- czy pokazać tytuły żartów,
- czy dołączyć notatki,
- czy dołączyć przejścia,
- czy zachować podwójne odstępy (puste linie),
- czy dopisać czas występu na górze.

Podgląd aktualizuje się na żywo. Przycisk **„Drukuj / PDF"** otwiera gotową do
druku wersję (możesz zapisać ją jako PDF przez okno drukowania przeglądarki).

---

## Import i eksport (kopie zapasowe)

Ponieważ dane żyją tylko w Twojej przeglądarce, **rób kopie zapasowe**. Aplikacja
sama raz dziennie przypomni o tym dyskretnym powiadomieniem (💾).

Na stronie **Żarty** masz przyciski (na telefonie ukryte pod menu **☰**):

- **Eksportuj wszystko** — pobiera plik `satyryk-export-RRRR-MM-DD.json`
  ze wszystkimi żartami i setlistami.
- **Eksportuj wybrane** — otwiera okno, w którym wybierasz:
  - które statusy żartów dołączyć,
  - wszystkie wersje czy tylko najnowszą,
  - które setlisty dołączyć (i opcjonalnie tylko żarty z tych setlist),
  - czy sformatować plik „ładnie" (wcięcia — czytelniejsze, ale większy plik).
- **Importuj JSON** — wczytuje jeden lub więcej plików `.json`. Zaimportowane
  żarty i setlisty **dopisują się** do istniejących (import łączy, nie nadpisuje).
- **Usuń wszystko** — kasuje wszystkie żarty i setlisty (z potwierdzeniem).
  Nieodwracalne, więc najpierw zrób eksport.

> **Wskazówka:** eksport/import to też sposób na przeniesienie materiału między
> urządzeniami albo przeglądarkami — wyeksportuj tutaj, zaimportuj tam.

---

## Język i skróty

- **Język:** przełącznik **PL / EN** w prawym górnym rogu. Zmienia interfejs
  (nie tłumaczy Twoich żartów).
- **Skróty klawiszowe** (w edytorze żartu, gdy kursor nie jest w polu tekstowym):
  - `Ctrl+Z` — cofnij
  - `Ctrl+Shift+Z` — ponów

---

## Gdzie są moje dane?

Wszystko zapisuje się w **localStorage** Twojej przeglądarki, pod kluczem
`satyryk_v1`. Oznacza to, że:

- dane **nie opuszczają** Twojego urządzenia,
- są przypisane do **konkretnej przeglądarki na konkretnym urządzeniu**,
- **wyczyszczenie danych przeglądarki** (historii/„danych witryn") **skasuje** je,
- tryb prywatny/incognito zwykle nie zachowa danych po zamknięciu okna.

Dlatego jedyną prawdziwą kopią zapasową jest **wyeksportowany plik JSON** —
trzymaj go w bezpiecznym miejscu.
