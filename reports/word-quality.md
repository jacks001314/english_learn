# 词库质量报告

本报告由 `go run ./cmd/wordcheck` 自动生成。错误应优先修复，警告需要人工复核。

## 汇总

| 文件 | 词条数 | 错误 | 警告 |
| --- | ---: | ---: | ---: |
| `backend/primary_school.json` | 1331 | 0 | 17 |
| `backend/middle_school.json` | 2895 | 0 | 159 |

## 问题明细

## 问题类型汇总

| 类型 | 数量 |
| --- | ---: |
| `duplicate_word` | 54 |
| `meaning_page_reference` | 121 |
| `word_contains_pos` | 1 |

- ⚠️ `backend/middle_school.json` 第 23 条 `ability`：中文释义疑似残留教材页码（`meaning_page_reference`）
- ⚠️ `backend/middle_school.json` 第 39 条 `active`：中文释义疑似残留教材页码（`meaning_page_reference`）
- ⚠️ `backend/middle_school.json` 第 46 条 `address`：中文释义疑似残留教材页码（`meaning_page_reference`）
- ⚠️ `backend/middle_school.json` 第 47 条 `admire`：中文释义疑似残留教材页码（`meaning_page_reference`）
- ⚠️ `backend/middle_school.json` 第 75 条 `alfred`：中文释义疑似残留教材页码（`meaning_page_reference`）
- ⚠️ `backend/middle_school.json` 第 76 条 `alien`：中文释义疑似残留教材页码（`meaning_page_reference`）
- ⚠️ `backend/middle_school.json` 第 84 条 `all of a sudden`：中文释义疑似残留教材页码（`meaning_page_reference`）
- ⚠️ `backend/middle_school.json` 第 95 条 `aloud`：中文释义疑似残留教材页码（`meaning_page_reference`）
- ⚠️ `backend/middle_school.json` 第 109 条 `ancestor`：中文释义疑似残留教材页码（`meaning_page_reference`）
- ⚠️ `backend/middle_school.json` 第 116 条 `annie`：中文释义疑似残留教材页码（`meaning_page_reference`）
- ⚠️ `backend/middle_school.json` 第 153 条 `as soon as conj`：与第 152 条英文词形重复（`duplicate_word`）
- ⚠️ `backend/middle_school.json` 第 187 条 `attend`：中文释义疑似残留教材页码（`meaning_page_reference`）
- ⚠️ `backend/middle_school.json` 第 188 条 `attention`：中文释义疑似残留教材页码（`meaning_page_reference`）
- ⚠️ `backend/middle_school.json` 第 197 条 `avoid`：中文释义疑似残留教材页码（`meaning_page_reference`）
- ⚠️ `backend/middle_school.json` 第 296 条 `billy`：中文释义疑似残留教材页码（`meaning_page_reference`）
- ⚠️ `backend/middle_school.json` 第 301 条 `biscuit`：中文释义疑似残留教材页码（`meaning_page_reference`）
- ⚠️ `backend/middle_school.json` 第 311 条 `blouse`：中文释义疑似残留教材页码（`meaning_page_reference`）
- ⚠️ `backend/middle_school.json` 第 314 条 `blow(blew`：与第 312 条英文词形重复（`duplicate_word`）
- ⚠️ `backend/middle_school.json` 第 341 条 `brain`：中文释义疑似残留教材页码（`meaning_page_reference`）
- ⚠️ `backend/middle_school.json` 第 342 条 `brand`：中文释义疑似残留教材页码（`meaning_page_reference`）
- ⚠️ `backend/middle_school.json` 第 357 条 `britain`：中文释义疑似残留教材页码（`meaning_page_reference`）
- ⚠️ `backend/middle_school.json` 第 369 条 `burial`：中文释义疑似残留教材页码（`meaning_page_reference`）
- ⚠️ `backend/middle_school.json` 第 373 条 `business`：中文释义疑似残留教材页码（`meaning_page_reference`）
- ⚠️ `backend/middle_school.json` 第 384 条 `by mistake`：中文释义疑似残留教材页码（`meaning_page_reference`）
- ⚠️ `backend/middle_school.json` 第 406 条 `canadian`：中文释义疑似残留教材页码（`meaning_page_reference`）
- ⚠️ `backend/middle_school.json` 第 410 条 `candy`：中文释义疑似残留教材页码（`meaning_page_reference`）
- ⚠️ `backend/middle_school.json` 第 414 条 `cap`：中文释义疑似残留教材页码（`meaning_page_reference`）
- ⚠️ `backend/middle_school.json` 第 426 条 `carla`：中文释义疑似残留教材页码（`meaning_page_reference`）
- ⚠️ `backend/middle_school.json` 第 468 条 `chemistry`：中文释义疑似残留教材页码（`meaning_page_reference`）
- ⚠️ `backend/middle_school.json` 第 480 条 `choice`：中文释义疑似残留教材页码（`meaning_page_reference`）
- ⚠️ `backend/middle_school.json` 第 487 条 `circle`：中文释义疑似残留教材页码（`meaning_page_reference`）
- ⚠️ `backend/middle_school.json` 第 489 条 `clara`：中文释义疑似残留教材页码（`meaning_page_reference`）
- ⚠️ `backend/middle_school.json` 第 497 条 `clean.`：与第 495 条英文词形重复（`duplicate_word`）
- ⚠️ `backend/middle_school.json` 第 518 条 `coat`：中文释义疑似残留教材页码（`meaning_page_reference`）
- ⚠️ `backend/middle_school.json` 第 521 条 `coin`：中文释义疑似残留教材页码（`meaning_page_reference`）
- ⚠️ `backend/middle_school.json` 第 567 条 `connect … with`：中文释义疑似残留教材页码（`meaning_page_reference`）
- ⚠️ `backend/middle_school.json` 第 572 条 `convenient`：中文释义疑似残留教材页码（`meaning_page_reference`）
- ⚠️ `backend/middle_school.json` 第 573 条 `conversation`：中文释义疑似残留教材页码（`meaning_page_reference`）
- ⚠️ `backend/middle_school.json` 第 575 条 `cookie`：中文释义疑似残留教材页码（`meaning_page_reference`）
- ⚠️ `backend/middle_school.json` 第 581 条 `corner`：中文释义疑似残留教材页码（`meaning_page_reference`）
- ⚠️ `backend/middle_school.json` 第 585 条 `cotton`：中文释义疑似残留教材页码（`meaning_page_reference`）
- ⚠️ `backend/middle_school.json` 第 608 条 `crispy`：中文释义疑似残留教材页码（`meaning_page_reference`）
- ⚠️ `backend/middle_school.json` 第 631 条 `dance`：与第 630 条英文词形重复（`duplicate_word`）
- ⚠️ `backend/middle_school.json` 第 640 条 `dead`：中文释义疑似残留教材页码（`meaning_page_reference`）
- ⚠️ `backend/middle_school.json` 第 684 条 `direct`：中文释义疑似残留教材页码（`meaning_page_reference`）
- ⚠️ `backend/middle_school.json` 第 695 条 `discover`：中文释义疑似残留教材页码（`meaning_page_reference`）
- ⚠️ `backend/middle_school.json` 第 707 条 `divide ... into`：中文释义疑似残留教材页码（`meaning_page_reference`）
- ⚠️ `backend/middle_school.json` 第 738 条 `drink`：与第 737 条英文词形重复（`duplicate_word`）
- ⚠️ `backend/middle_school.json` 第 763 条 `earthquake`：中文释义疑似残留教材页码（`meaning_page_reference`）
- ⚠️ `backend/middle_school.json` 第 765 条 `east`：中文释义疑似残留教材页码（`meaning_page_reference`）
- ⚠️ `backend/middle_school.json` 第 792 条 `emily`：中文释义疑似残留教材页码（`meaning_page_reference`）
- ⚠️ `backend/middle_school.json` 第 798 条 `enemy`：中文释义疑似残留教材页码（`meaning_page_reference`）
- ⚠️ `backend/middle_school.json` 第 799 条 `energy`：中文释义疑似残留教材页码（`meaning_page_reference`）
- ⚠️ `backend/middle_school.json` 第 819 条 `even though`：中文释义疑似残留教材页码（`meaning_page_reference`）
- ⚠️ `backend/middle_school.json` 第 820 条 `even though conj`：与第 819 条英文词形重复（`duplicate_word`）
- ⚠️ `backend/middle_school.json` 第 821 条 `even though（=even if）`：与第 819 条英文词形重复（`duplicate_word`）
- ⚠️ `backend/middle_school.json` 第 855 条 `express`：中文释义疑似残留教材页码（`meaning_page_reference`）
- ⚠️ `backend/middle_school.json` 第 856 条 `expression`：中文释义疑似残留教材页码（`meaning_page_reference`）
- ⚠️ `backend/middle_school.json` 第 865 条 `faithfully`：中文释义疑似残留教材页码（`meaning_page_reference`）
- ⚠️ `backend/middle_school.json` 第 871 条 `fall in love with`：中文释义疑似残留教材页码（`meaning_page_reference`）
- ⚠️ `backend/middle_school.json` 第 890 条 `fascinating`：中文释义疑似残留教材页码（`meaning_page_reference`）
- ⚠️ `backend/middle_school.json` 第 967 条 `fork`：中文释义疑似残留教材页码（`meaning_page_reference`）
- ⚠️ `backend/middle_school.json` 第 977 条 `france`：中文释义疑似残留教材页码（`meaning_page_reference`）
- ⚠️ `backend/middle_school.json` 第 984 条 `fridge`：中文释义疑似残留教材页码（`meaning_page_reference`）
- ⚠️ `backend/middle_school.json` 第 1005 条 `garden`：中文释义疑似残留教材页码（`meaning_page_reference`）
- ⚠️ `backend/middle_school.json` 第 1013 条 `germany`：中文释义疑似残留教材页码（`meaning_page_reference`）
- ⚠️ `backend/middle_school.json` 第 1048 条 `glass`：中文释义疑似残留教材页码（`meaning_page_reference`）
- ⚠️ `backend/middle_school.json` 第 1087 条 `grammar`：中文释义疑似残留教材页码（`meaning_page_reference`）
- ⚠️ `backend/middle_school.json` 第 1096 条 `grass`：中文释义疑似残留教材页码（`meaning_page_reference`）
- ⚠️ `backend/middle_school.json` 第 1119 条 `halfway`：与第 1118 条英文词形重复（`duplicate_word`）
- ⚠️ `backend/middle_school.json` 第 1121 条 `halloween`：中文释义疑似残留教材页码（`meaning_page_reference`）
- ⚠️ `backend/middle_school.json` 第 1127 条 `handbag`：中文释义疑似残留教材页码（`meaning_page_reference`）
- ⚠️ `backend/middle_school.json` 第 1137 条 `hard-working adj`：与第 1136 条英文词形重复（`duplicate_word`）
- ⚠️ `backend/middle_school.json` 第 1150 条 `have a cold phr. (`：与第 1149 条英文词形重复（`duplicate_word`）
- ⚠️ `backend/middle_school.json` 第 1156 条 `have a good time=enjoy oneself=have fun(doing sth.)`：与第 1154 条英文词形重复（`duplicate_word`）
- ⚠️ `backend/middle_school.json` 第 1178 条 `hear(heard）`：与第 1176 条英文词形重复（`duplicate_word`）
- ⚠️ `backend/middle_school.json` 第 1202 条 `high school n`：与第 1201 条英文词形重复（`duplicate_word`）
- ⚠️ `backend/middle_school.json` 第 1241 条 `how are you？`：与第 1240 条英文词形重复（`duplicate_word`）
- ⚠️ `backend/middle_school.json` 第 1302 条 `increase`：中文释义疑似残留教材页码（`meaning_page_reference`）
- ⚠️ `backend/middle_school.json` 第 1327 条 `introduction`：中文释义疑似残留教材页码（`meaning_page_reference`）
- ⚠️ `backend/middle_school.json` 第 1353 条 `jean`：中文释义疑似残留教材页码（`meaning_page_reference`）
- ⚠️ `backend/middle_school.json` 第 1357 条 `jerry`：中文释义疑似残留教材页码（`meaning_page_reference`）
- ⚠️ `backend/middle_school.json` 第 1363 条 `join.`：与第 1362 条英文词形重复（`duplicate_word`）
- ⚠️ `backend/middle_school.json` 第 1413 条 `knowledge`：中文释义疑似残留教材页码（`meaning_page_reference`）
- ⚠️ `backend/middle_school.json` 第 1423 条 `lantern`：中文释义疑似残留教材页码（`meaning_page_reference`）
- ⚠️ `backend/middle_school.json` 第 1441 条 `leader`：中文释义疑似残留教材页码（`meaning_page_reference`）
- ⚠️ `backend/middle_school.json` 第 1454 条 `lend(lent`：与第 1453 条英文词形重复（`duplicate_word`）
- ⚠️ `backend/middle_school.json` 第 1461 条 `let's = let us`：与第 1460 条英文词形重复（`duplicate_word`）
- ⚠️ `backend/middle_school.json` 第 1489 条 `living room n`：与第 1488 条英文词形重复（`duplicate_word`）
- ⚠️ `backend/middle_school.json` 第 1490 条 `living-room n`：与第 1488 条英文词形重复（`duplicate_word`）
- ⚠️ `backend/middle_school.json` 第 1491 条 `local`：中文释义疑似残留教材页码（`meaning_page_reference`）
- ⚠️ `backend/middle_school.json` 第 1493 条 `lock`：中文释义疑似残留教材页码（`meaning_page_reference`）
- ⚠️ `backend/middle_school.json` 第 1508 条 `look up to`：中文释义疑似残留教材页码（`meaning_page_reference`）
- ⚠️ `backend/middle_school.json` 第 1534 条 `mail`：中文释义疑似残留教材页码（`meaning_page_reference`）
- ⚠️ `backend/middle_school.json` 第 1560 条 `mall`：中文释义疑似残留教材页码（`meaning_page_reference`）
- ⚠️ `backend/middle_school.json` 第 1578 条 `material`：中文释义疑似残留教材页码（`meaning_page_reference`）
- ⚠️ `backend/middle_school.json` 第 1615 条 `middle school n`：与第 1614 条英文词形重复（`duplicate_word`）
- ⚠️ `backend/middle_school.json` 第 1686 条 `mystery`：中文释义疑似残留教材页码（`meaning_page_reference`）
- ⚠️ `backend/middle_school.json` 第 1725 条 `no matter`：中文释义疑似残留教材页码（`meaning_page_reference`）
- ⚠️ `backend/middle_school.json` 第 1729 条 `noise`：中文释义疑似残留教材页码（`meaning_page_reference`）
- ⚠️ `backend/middle_school.json` 第 1743 条 `not only … but also`：中文释义疑似残留教材页码（`meaning_page_reference`）
- ⚠️ `backend/middle_school.json` 第 1747 条 `note`：中文释义疑似残留教材页码（`meaning_page_reference`）
- ⚠️ `backend/middle_school.json` 第 1750 条 `nothing(=not…anything)`：与第 1749 条英文词形重复（`duplicate_word`）
- ⚠️ `backend/middle_school.json` 第 1760 条 `o'clock (=of the clock) ad. v`：与第 1759 条英文词形重复（`duplicate_word`）
- ⚠️ `backend/middle_school.json` 第 1776 条 `ok adv (`：与第 1775 条英文词形重复（`duplicate_word`）
- ⚠️ `backend/middle_school.json` 第 1829 条 `overnight`：中文释义疑似残留教材页码（`meaning_page_reference`）
- ⚠️ `backend/middle_school.json` 第 1840 条 `paint`：与第 1838 条英文词形重复（`duplicate_word`）
- ⚠️ `backend/middle_school.json` 第 1844 条 `pal`：中文释义疑似残留教材页码（`meaning_page_reference`）
- ⚠️ `backend/middle_school.json` 第 1852 条 `pardon`：中文释义疑似残留教材页码（`meaning_page_reference`）
- ⚠️ `backend/middle_school.json` 第 1861 条 `partner`：中文释义疑似残留教材页码（`meaning_page_reference`）
- ⚠️ `backend/middle_school.json` 第 1870 条 `patient`：中文释义疑似残留教材页码（`meaning_page_reference`）
- ⚠️ `backend/middle_school.json` 第 1871 条 `pattern`：中文释义疑似残留教材页码（`meaning_page_reference`）
- ⚠️ `backend/middle_school.json` 第 1872 条 `paula`：中文释义疑似残留教材页码（`meaning_page_reference`）
- ⚠️ `backend/middle_school.json` 第 1875 条 `pay (paid`：与第 1874 条英文词形重复（`duplicate_word`）
- ⚠️ `backend/middle_school.json` 第 1876 条 `pay attention to`：中文释义疑似残留教材页码（`meaning_page_reference`）
- ⚠️ `backend/middle_school.json` 第 1888 条 `pencil-box n`：与第 1887 条英文词形重复（`duplicate_word`）
- ⚠️ `backend/middle_school.json` 第 1898 条 `period`：中文释义疑似残留教材页码（`meaning_page_reference`）
- ⚠️ `backend/middle_school.json` 第 1905 条 `physics`：中文释义疑似残留教材页码（`meaning_page_reference`）
- ⚠️ `backend/middle_school.json` 第 1912 条 `picnic`：中文释义疑似残留教材页码（`meaning_page_reference`）
- ⚠️ `backend/middle_school.json` 第 1952 条 `policeman`：中文释义疑似残留教材页码（`meaning_page_reference`）
- ⚠️ `backend/middle_school.json` 第 1965 条 `position`：中文释义疑似残留教材页码（`meaning_page_reference`）
- ⚠️ `backend/middle_school.json` 第 1969 条 `post office n`：与第 1968 条英文词形重复（`duplicate_word`）
- ⚠️ `backend/middle_school.json` 第 1984 条 `prep.`：与第 1779 条英文词形重复（`duplicate_word`）
- ⚠️ `backend/middle_school.json` 第 1992 条 `prevent`：中文释义疑似残留教材页码（`meaning_page_reference`）
- ⚠️ `backend/middle_school.json` 第 2006 条 `product`：中文释义疑似残留教材页码（`meaning_page_reference`）
- ⚠️ `backend/middle_school.json` 第 2013 条 `pronounce`：中文释义疑似残留教材页码（`meaning_page_reference`）
- ⚠️ `backend/middle_school.json` 第 2025 条 `punish`：中文释义疑似残留教材页码（`meaning_page_reference`）
- ⚠️ `backend/middle_school.json` 第 2028 条 `purpose`：中文释义疑似残留教材页码（`meaning_page_reference`）
- ⚠️ `backend/middle_school.json` 第 2036 条 `put on phr. (`：与第 2035 条英文词形重复（`duplicate_word`）
- ⚠️ `backend/middle_school.json` 第 2045 条 `quick`：中文释义疑似残留教材页码（`meaning_page_reference`）
- ⚠️ `backend/middle_school.json` 第 2077 条 `receive`：中文释义疑似残留教材页码（`meaning_page_reference`）
- ⚠️ `backend/middle_school.json` 第 2099 条 `repeat`：中文释义疑似残留教材页码（`meaning_page_reference`）
- ⚠️ `backend/middle_school.json` 第 2103 条 `request`：中文释义疑似残留教材页码（`meaning_page_reference`）
- ⚠️ `backend/middle_school.json` 第 2110 条 `restroom`：中文释义疑似残留教材页码（`meaning_page_reference`）
- ⚠️ `backend/middle_school.json` 第 2114 条 `review`：中文释义疑似残留教材页码（`meaning_page_reference`）
- ⚠️ `backend/middle_school.json` 第 2155 条 `rush`：中文释义疑似残留教材页码（`meaning_page_reference`）
- ⚠️ `backend/middle_school.json` 第 2205 条 `secret`：中文释义疑似残留教材页码（`meaning_page_reference`）
- ⚠️ `backend/middle_school.json` 第 2218 条 `sentence`：中文释义疑似残留教材页码（`meaning_page_reference`）
- ⚠️ `backend/middle_school.json` 第 2250 条 `shoot(shot`：与第 2249 条英文词形重复（`duplicate_word`）
- ⚠️ `backend/middle_school.json` 第 2281 条 `sing`：与第 2279 条英文词形重复（`duplicate_word`）
- ⚠️ `backend/middle_school.json` 第 2301 条 `sleepy`：中文释义疑似残留教材页码（`meaning_page_reference`）
- ⚠️ `backend/middle_school.json` 第 2353 条 `sour`：中文释义疑似残留教材页码（`meaning_page_reference`）
- ⚠️ `backend/middle_school.json` 第 2364 条 `speak spiːk]`：与第 2362 条英文词形重复（`duplicate_word`）
- ⚠️ `backend/middle_school.json` 第 2368 条 `speed`：中文释义疑似残留教材页码（`meaning_page_reference`）
- ⚠️ `backend/middle_school.json` 第 2372 条 `spider`：中文释义疑似残留教材页码（`meaning_page_reference`）
- ⚠️ `backend/middle_school.json` 第 2418 条 `stranger`：中文释义疑似残留教材页码（`meaning_page_reference`）
- ⚠️ `backend/middle_school.json` 第 2450 条 `sunshine`：与第 2445 条英文词形重复（`duplicate_word`）
- ⚠️ `backend/middle_school.json` 第 2489 条 `take off （`：与第 2488 条英文词形重复（`duplicate_word`）
- ⚠️ `backend/middle_school.json` 第 2534 条 `telephone(phone`：与第 2533 条英文词形重复（`duplicate_word`）
- ⚠️ `backend/middle_school.json` 第 2726 条 `usa n`：英文词汇末尾疑似混入词性标记（`word_contains_pos`）
- ⚠️ `backend/middle_school.json` 第 2740 条 `victor`：中文释义疑似残留教材页码（`meaning_page_reference`）
- ⚠️ `backend/middle_school.json` 第 2741 条 `victory`：中文释义疑似残留教材页码（`meaning_page_reference`）
- ⚠️ `backend/middle_school.json` 第 2766 条 `warn`：中文释义疑似残留教材页码（`meaning_page_reference`）
- ⚠️ `backend/middle_school.json` 第 2770 条 `washroom`：中文释义疑似残留教材页码（`meaning_page_reference`）
- ⚠️ `backend/middle_school.json` 第 2791 条 `weekend.`：与第 2790 条英文词形重复（`duplicate_word`）
- ⚠️ `backend/middle_school.json` 第 2805 条 `what about...?(`：与第 2804 条英文词形重复（`duplicate_word`）
- ⚠️ `backend/middle_school.json` 第 2839 条 `wisely`：中文释义疑似残留教材页码（`meaning_page_reference`）
- ⚠️ `backend/middle_school.json` 第 2843 条 `without doubt`：中文释义疑似残留教材页码（`meaning_page_reference`）
- ⚠️ `backend/middle_school.json` 第 2844 条 `wolf`：中文释义疑似残留教材页码（`meaning_page_reference`）
- ⚠️ `backend/primary_school.json` 第 461 条 `grandfather`：与第 420 条英文词形重复（`duplicate_word`）
- ⚠️ `backend/primary_school.json` 第 744 条 `no. problem`：与第 743 条英文词形重复（`duplicate_word`）
- ⚠️ `backend/primary_school.json` 第 962 条 `ship：`：与第 961 条英文词形重复（`duplicate_word`）
- ⚠️ `backend/primary_school.json` 第 1069 条 `subway：`：与第 1068 条英文词形重复（`duplicate_word`）
- ⚠️ `backend/primary_school.json` 第 1086 条 `t-shirt t`：与第 1085 条英文词形重复（`duplicate_word`）
- ⚠️ `backend/primary_school.json` 第 1108 条 `teacher's desk`：与第 1107 条英文词形重复（`duplicate_word`）
- ⚠️ `backend/primary_school.json` 第 1110 条 `teacher,s desk`：与第 1107 条英文词形重复（`duplicate_word`）
- ⚠️ `backend/primary_school.json` 第 1111 条 `teacher,s-office`：与第 1109 条英文词形重复（`duplicate_word`）
- ⚠️ `backend/primary_school.json` 第 1113 条 `teachers'`：与第 1112 条英文词形重复（`duplicate_word`）
- ⚠️ `backend/primary_school.json` 第 1125 条 `the great wall`：与第 1124 条英文词形重复（`duplicate_word`）
- ⚠️ `backend/primary_school.json` 第 1131 条 `then：`：与第 1130 条英文词形重复（`duplicate_word`）
- ⚠️ `backend/primary_school.json` 第 1168 条 `tomoto`：与第 1166 条英文词形重复（`duplicate_word`）
- ⚠️ `backend/primary_school.json` 第 1182 条 `traffic：`：与第 1178 条英文词形重复（`duplicate_word`）
- ⚠️ `backend/primary_school.json` 第 1184 条 `train：`：与第 1183 条英文词形重复（`duplicate_word`）
- ⚠️ `backend/primary_school.json` 第 1188 条 `tried`：与第 1161 条英文词形重复（`duplicate_word`）
- ⚠️ `backend/primary_school.json` 第 1195 条 `turn：`：与第 1194 条英文词形重复（`duplicate_word`）
- ⚠️ `backend/primary_school.json` 第 1305 条 `work.`：与第 1304 条英文词形重复（`duplicate_word`）
