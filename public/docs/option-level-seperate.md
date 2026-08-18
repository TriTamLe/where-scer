## 1. Định nghĩa

Ta có:

[
n = \text{số người}
]

[
o = \text{số phương án}
]

[
s_i = \text{số người chọn phương án } i
]

[
s = \sum_{i=1}^{o}s_i
]

Và một đại lượng khá hữu ích:

[
r = \frac{s}{n}
]

`r` là **số phương án trung bình mà một người chọn**.

Ví dụ:

```text
n = 100
o = 5
s = 180
```

thì trung bình mỗi người chọn:

[
180 / 100 = 1.8
]

phương án.

---

# Thuật toán 1: Interest Rate

Đơn giản nhất và cũng dễ giải thích nhất:

[
I_i = \frac{s_i}{n}
]

Ví dụ:

```text
100 người

A: 80 người chọn
B: 50 người chọn
C: 20 người chọn
D: 5 người chọn
```

thì:

| Option | `s_i` | Interest Rate |
| ------ | ----: | ------------: |
| A      |    80 |           80% |
| B      |    50 |           50% |
| C      |    20 |           20% |
| D      |     5 |            5% |

Sau đó phân loại:

```text
>= 70%    Rất cao
>= 40%    Cao
>= 20%    Trung bình
>= 10%    Thấp
< 10%     Rất thấp
```

### Ưu điểm

Rất trực quan:

> "60% người tham gia quan tâm phương án A."

### Nhược điểm

Nó không xét đến việc **người dùng nói chung chọn nhiều hay ít option**.

Ví dụ hai survey:

```text
Survey A:
trung bình mỗi người chọn 1 option

Survey B:
trung bình mỗi người chọn 8 options
```

Một option được 40% người chọn trong hai survey này có ý nghĩa khá khác nhau.

---

# Thuật toán 2: Share of Attention

Ta tính:

[
A_i = \frac{s_i}{s}
]

Nó trả lời câu hỏi:

> Trong toàn bộ các lựa chọn được tạo ra, option này chiếm bao nhiêu?

Ví dụ:

```text
n = 100
s = 200

A = 80
B = 60
C = 40
D = 20
```

thì:

```text
A = 40%
B = 30%
C = 20%
D = 10%
```

Cái này rất phù hợp để **xếp hạng option với nhau**.

Nhưng đừng dùng riêng nó để kết luận kiểu:

> "40% người dùng quan tâm."

Sai đấy. 40% ở đây là **share of selections**, không phải share of people.

---

# 3. Thuật toán tôi thấy thú vị nhất: Relative Interest / Lift

Ta có thể hỏi:

> Nếu sự quan tâm được phân bổ đều cho tất cả `o` phương án thì mỗi phương án đáng lẽ nhận bao nhiêu lượt chọn?

Baseline:

[
E = \frac{s}{o}
]

Sau đó:

[
L_i = \frac{s_i}{s/o}
]

hay:

[
\boxed{L_i = \frac{o \times s_i}{s}}
]

Đây là một dạng **lift score**.

Ý nghĩa rất đẹp:

```text
L = 1
```

→ đúng bằng mức quan tâm trung bình.

```text
L > 1
```

→ được quan tâm trên trung bình.

```text
L < 1
```

→ dưới trung bình.

Ví dụ:

```text
n = 100
o = 5
s = 200
```

Average option:

[
200 / 5 = 40
]

Giả sử:

```text
A = 80
B = 50
C = 40
D = 20
E = 10
```

ta có:

| Option | `s_i` | Lift |
| ------ | ----: | ---: |
| A      |    80 | 2.00 |
| B      |    50 | 1.25 |
| C      |    40 | 1.00 |
| D      |    20 | 0.50 |
| E      |    10 | 0.25 |

Có thể phân loại:

|          Lift | Mức        |
| ------------: | ---------- |
|     `>= 1.75` | Rất cao    |
| `1.25 – 1.75` | Cao        |
| `0.75 – 1.25` | Trung bình |
|  `0.5 – 0.75` | Thấp       |
|       `< 0.5` | Rất thấp   |

Tôi khá thích cách này nếu mục tiêu của bạn là **so sánh các phương án trong cùng một khảo sát**.

---

# 4. Nhưng tốt nhất: kết hợp Absolute + Relative

Tôi sẽ không dùng một chỉ số duy nhất ngay từ đầu.

Ta có hai biến:

### Absolute Interest

[
P_i = \frac{s_i}{n}
]

### Relative Interest

[
L_i = \frac{o s_i}{s}
]

Hai con số kể hai câu chuyện khác nhau.

Ví dụ:

```text
n = 100
o = 10
s = 500
```

Option A:

```text
s_A = 70
```

thì:

[
P_A = 70/100 = 70%
]

Rất nhiều người chọn nó.

Nhưng:

[
L_A = \frac{10\times70}{500}=1.4
]

Nó chỉ cao hơn trung bình khoảng **40%**.

Điều này xảy ra vì survey này có:

[
s/n=5
]

Tức là mỗi người tick trung bình tận 5 option. Người dùng có vẻ khá hào phóng với checkbox.

---

# 5. Composite Interest Score

Nếu bạn thực sự cần ép nó thành **một score duy nhất**, tôi đề xuất:

[
Score_i =
\alpha \frac{s_i}{n} +
(1-\alpha)\frac{s_i}{s/o}
]

Nhưng vấn đề là hai thành phần không cùng scale, nên nên normalize `Lift`.

Có thể dùng:

[
R_i = \frac{L_i}{1+L_i}
]

để đưa lift về khoảng `[0,1]`.

Sau đó:

[
\boxed{
Score_i =
\alpha P_i +
(1-\alpha)R_i
}
]

Ví dụ chọn:

[
\alpha = 0.7
]

thì:

[
Score_i =
0.7\frac{s_i}{n} +
0.3\frac{L_i}{1+L_i}
]

Nghĩa là:

- **70% trọng số:** bao nhiêu người thực sự chọn
- **30%:** nó nổi bật thế nào so với các option khác

---

# 6. Có một cách còn sạch hơn: classification 2 chiều

Nếu đây là hệ thống thật, tôi lại thích cách này hơn việc bịa ra một con số thần thánh kiểu `InterestScore = 73.42`, vì con người rất thích biến những thứ không chắc chắn thành số có hai chữ số thập phân.

Dùng:

[
P_i = s_i/n
]

và

[
L_i = os_i/s
]

Sau đó chia thành:

|                   | Lift thấp                    | Lift cao           |
| ----------------- | ---------------------------- | ------------------ |
| **Adoption cao**  | Phổ biến nhưng không nổi bật | **Core Interest**  |
| **Adoption thấp** | Low Interest                 | **Niche Interest** |

Ví dụ:

### Core Interest

```text
P_i cao
L_i cao
```

→ nhiều người quan tâm và nổi bật hơn các phương án khác.

### Popular / General Interest

```text
P_i cao
L_i ≈ 1
```

→ nhiều người chọn, nhưng cũng bởi vì mọi người chọn rất nhiều option.

### Niche Interest

```text
P_i thấp
L_i cao
```

→ số người không lớn nhưng option nổi bật tương đối.

### Low Interest

```text
P_i thấp
L_i thấp
```

→ thực sự ít được quan tâm.

Đây thường là thông tin **có ý nghĩa sản phẩm hơn rất nhiều** so với Low / Medium / High đơn thuần.

---

# 7. Một chỉ số nữa nên tính: Engagement

Toàn survey cũng có một chỉ số đáng quan tâm:

[
E = \frac{s}{n}
]

nhưng vì một người được chọn nhiều option nên đây chính xác là:

> **Average selections per participant**

Nếu bạn biết thêm số người **không chọn phương án nào**, gọi là `n_0`, thì:

[
ParticipationRate =
\frac{n-n_0}{n}
]

Cái này rất quan trọng.

Ví dụ:

```text
100 người
10 option
200 selections
```

có thể là:

```text
Scenario A
100 người đều chọn
trung bình 2 option/người
```

hoặc:

```text
Scenario B
20 người chọn mỗi người 10 option
80 người không chọn gì
```

Cả hai đều có:

[
s=200
]

nhưng ý nghĩa hoàn toàn khác.

**Chỉ với `n, o, s, s_i`, bạn không thể phân biệt hai trường hợp này.**

Nếu database cho phép, tôi rất khuyên lưu cả:

```text
numberOfParticipants
numberOfRespondents
numberOfSelections
optionSelectionCounts[]
```

---

# Thuật toán tôi đề xuất

Nếu đang thiết kế một feature thật, tôi sẽ dùng:

[
\boxed{Adoption_i = \frac{s_i}{n}}
]

và

[
\boxed{Lift_i = \frac{o s_i}{s}}
]

rồi classification dựa trên **hai chiều** thay vì một score.

Chẳng hạn:

```text
Adoption:
>= 50%  High
20-50%  Medium
< 20%   Low

Lift:
>= 1.25 Above average
0.75-1.25 Average
< 0.75 Below average
```

Từ đó bạn có ma trận rất dễ hiểu:

```text
              Relative interest

              Low       Avg       High
           ┌─────────┬─────────┬─────────┐
High       │ Popular │ Popular │  CORE   │
Adoption   ├─────────┼─────────┼─────────┤
Medium     │   Low   │ Normal  │ Strong  │
           ├─────────┼─────────┼─────────┤
Low        │   LOW   │  Niche  │  NICHE  │
           └─────────┴─────────┴─────────┘
```

Cách này giữ được cả **độ phổ biến tuyệt đối** lẫn **độ nổi bật tương đối**, và không làm mất thông tin bằng cách nhét mọi thứ vào một con số duy nhất. Đây là phương án tôi sẽ ưu tiên cho dashboard hoặc recommendation/analytics feature.
