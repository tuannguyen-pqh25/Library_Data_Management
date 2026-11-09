# Graph Report - LibraryManagement  (2026-11-08)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 586 nodes · 1103 edges · 30 communities (15 shown, 15 thin omitted)
- Extraction: 93% EXTRACTED · 7% INFERRED · 0% AMBIGUOUS · INFERRED: 73 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `7e99e60c`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Community 0
- Community 1
- Community 2
- Community 3
- Community 4
- Community 5
- Community 6
- Community 7
- Community 8
- Community 9
- Community 10
- Community 11
- Community 13
- Community 15
- Community 17

## God Nodes (most connected - your core abstractions)
1. `showError()` - 31 edges
2. `vue` - 27 edges
3. `vuex` - 21 edges
4. `showSuccess()` - 18 edges
5. `sequelize` - 17 edges
6. `api` - 15 edges
7. `sequelize` - 14 edges
8. `auth()` - 13 edges
9. `express` - 12 edges
10. `adminAuth()` - 11 edges

## Surprising Connections (you probably didn't know these)
- `setup()` --calls--> `getDashboardReport()`  [EXTRACTED]
  frontend/src/components/admin/AdminHomePage.vue → frontend/src/services/dashboardReportService.js
- `setup()` --calls--> `showError()`  [EXTRACTED]
  frontend/src/components/admin/BorrowManagement.vue → frontend/src/utils/notifications.js
- `setup()` --calls--> `showError()`  [EXTRACTED]
  frontend/src/components/auth/LoginForm.vue → frontend/src/utils/notifications.js
- `setup()` --calls--> `showError()`  [EXTRACTED]
  frontend/src/components/reader/AuthorList.vue → frontend/src/utils/notifications.js
- `setup()` --calls--> `showError()`  [EXTRACTED]
  frontend/src/components/reader/BookList.vue → frontend/src/utils/notifications.js

## Import Cycles
- 3-file cycle: `frontend/src/services/api.js -> frontend/src/store/index.js -> frontend/src/store/modules/auth.js -> frontend/src/services/api.js`
- 3-file cycle: `frontend/src/services/api.js -> frontend/src/store/index.js -> frontend/src/store/modules/category.js -> frontend/src/services/api.js`
- 3-file cycle: `frontend/src/services/api.js -> frontend/src/store/index.js -> frontend/src/store/modules/publisher.js -> frontend/src/services/api.js`
- 3-file cycle: `frontend/src/services/api.js -> frontend/src/store/index.js -> frontend/src/store/modules/borrow.js -> frontend/src/services/api.js`
- 3-file cycle: `frontend/src/services/api.js -> frontend/src/store/index.js -> frontend/src/store/modules/author.js -> frontend/src/services/api.js`
- 3-file cycle: `frontend/src/services/api.js -> frontend/src/store/index.js -> frontend/src/store/modules/book.js -> frontend/src/services/api.js`
- 4-file cycle: `frontend/src/router/index.js -> frontend/src/store/index.js -> frontend/src/store/modules/auth.js -> frontend/src/services/api.js -> frontend/src/router/index.js`
- 4-file cycle: `frontend/src/router/index.js -> frontend/src/store/index.js -> frontend/src/store/modules/category.js -> frontend/src/services/api.js -> frontend/src/router/index.js`
- 4-file cycle: `frontend/src/router/index.js -> frontend/src/store/index.js -> frontend/src/store/modules/publisher.js -> frontend/src/services/api.js -> frontend/src/router/index.js`
- 4-file cycle: `frontend/src/router/index.js -> frontend/src/store/index.js -> frontend/src/store/modules/borrow.js -> frontend/src/services/api.js -> frontend/src/router/index.js`
- 4-file cycle: `frontend/src/router/index.js -> frontend/src/store/index.js -> frontend/src/store/modules/author.js -> frontend/src/services/api.js -> frontend/src/router/index.js`
- 4-file cycle: `frontend/src/router/index.js -> frontend/src/store/index.js -> frontend/src/store/modules/book.js -> frontend/src/services/api.js -> frontend/src/router/index.js`
- 4-file cycle: `frontend/src/components/admin/BookManagement.vue -> frontend/src/services/api.js -> frontend/src/router/index.js -> frontend/src/views/AdminDashboard.vue -> frontend/src/components/admin/BookManagement.vue`
- 4-file cycle: `frontend/src/components/admin/BorrowManagement.vue -> frontend/src/services/api.js -> frontend/src/router/index.js -> frontend/src/views/AdminDashboard.vue -> frontend/src/components/admin/BorrowManagement.vue`
- 4-file cycle: `frontend/src/components/admin/ReaderManagement.vue -> frontend/src/services/api.js -> frontend/src/router/index.js -> frontend/src/views/AdminDashboard.vue -> frontend/src/components/admin/ReaderManagement.vue`
- 4-file cycle: `frontend/src/components/admin/StaffManagement.vue -> frontend/src/services/api.js -> frontend/src/router/index.js -> frontend/src/views/AdminDashboard.vue -> frontend/src/components/admin/StaffManagement.vue`
- 4-file cycle: `frontend/src/components/auth/ConfirmPasswordForm.vue -> frontend/src/services/api.js -> frontend/src/router/index.js -> frontend/src/views/ConfirmPassword.vue -> frontend/src/components/auth/ConfirmPasswordForm.vue`
- 4-file cycle: `frontend/src/components/auth/ForgotPasswordForm.vue -> frontend/src/services/api.js -> frontend/src/router/index.js -> frontend/src/views/ForgotPassword.vue -> frontend/src/components/auth/ForgotPasswordForm.vue`
- 4-file cycle: `frontend/src/components/reader/BorrowHistory.vue -> frontend/src/services/api.js -> frontend/src/router/index.js -> frontend/src/views/ReaderDashboard.vue -> frontend/src/components/reader/BorrowHistory.vue`
- 5-file cycle: `frontend/src/components/admin/AdminHomePage.vue -> frontend/src/services/dashboardReportService.js -> frontend/src/services/api.js -> frontend/src/router/index.js -> frontend/src/views/AdminDashboard.vue -> frontend/src/components/admin/AdminHomePage.vue`

## Communities (30 total, 15 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.05
Nodes (51): createBook(), deleteBook(), fs, getAllBooks(), getBookById(), path, updateBook(), bcrypt (+43 more)

### Community 1 - "Community 1"
Cohesion: 0.09
Nodes (28): setup(), setup(), setup(), setup(), setup(), setup(), setup(), setup() (+20 more)

### Community 2 - "Community 2"
Cohesion: 0.04
Nodes (4): actions, getters, mutations, state

### Community 3 - "Community 3"
Cohesion: 0.06
Nodes (43): multer, storage, upload, author, dependencies, bcryptjs@^2.4.3, cors@^2.8.5, dotenv@^16.6.1 (+35 more)

### Community 4 - "Community 4"
Cohesion: 0.06
Nodes (36): dependencies, axios@^1.10.0, bootstrap@^5.3.3, chart.js@^4.5.0, @fortawesome/fontawesome-free@^6.5.1, socket.io-client@^4.8.1, vue@^3.2.47, vue-chartjs@^5.3.2 (+28 more)

### Community 5 - "Community 5"
Cohesion: 0.08
Nodes (33): createAuthor(), deleteAuthor(), getAllAuthors(), getAuthorById(), updateAuthor(), validateAuthorData(), createCategory(), deleteCategory() (+25 more)

### Community 6 - "Community 6"
Cohesion: 0.07
Nodes (24): constraintFields, down(), findExpectedIndex(), up(), bcrypt, dateOnly(), getScenarioDates(), main() (+16 more)

### Community 7 - "Community 7"
Cohesion: 0.06
Nodes (19): ChiTietPhieuMuon, { DataTypes, Model }, { DataTypes, Model }, DocGia, { DataTypes, Model }, NhanVien, { DataTypes, Model }, NhaXuatBan (+11 more)

### Community 8 - "Community 8"
Cohesion: 0.10
Nodes (19): getDashboardSummary(), getDetailedUnreturnedLoans(), getMonthlyBorrowCount(), getStatistics(), getUnreturnedLoans(), procedureNumber(), procedureRows(), { QueryTypes } (+11 more)

### Community 9 - "Community 9"
Cohesion: 0.17
Nodes (25): canAccessReaderRecord(), createBorrowRequest(), enrichLoans(), exportBorrowSlip(), exportPenaltyForm(), exportReturnSlip(), getAllBorrowRequests(), getDetails() (+17 more)

### Community 10 - "Community 10"
Cohesion: 0.15
Nodes (19): crypto, generateOTP(), nodemailer, sendVerificationEmail(), transporter, bcrypt, checkReaderStatus(), confirmPasswordReset() (+11 more)

### Community 11 - "Community 11"
Cohesion: 0.10
Nodes (20): MYSQL_DATABASE, MYSQL_PASSWORD, MYSQL_ROOT_PASSWORD, MYSQL_USER, interval, retries, test, timeout (+12 more)

### Community 13 - "Community 13"
Cohesion: 0.24
Nodes (9): bookDetailWhere(), completeKey(), detailReturnWhere(), loanDetailWhere(), registerAssociations(), assert, modelFactories, { Sequelize, DataTypes } (+1 more)

### Community 15 - "Community 15"
Cohesion: 0.47
Nodes (8): setup(), closeMenu(), handleKeydown(), handleOutsidePointer(), isSelected(), openMenu(), selectOption(), toggleMenu()

### Community 17 - "Community 17"
Cohesion: 0.50
Nodes (3): compilerOptions, paths, exclude

## Knowledge Gaps
- **15 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `auth()` connect `Community 10` to `Community 0`, `Community 2`, `Community 5`, `Community 8`, `Community 9`?**
  _High betweenness centrality (0.348) - this node is a cross-community bridge._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.0532724505327245 - nodes in this community are weakly interconnected._
- **Why does `vuex` connect `Community 1` to `Community 2`, `Community 4`?**
  _High betweenness centrality (0.142) - this node is a cross-community bridge._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.09438103599648814 - nodes in this community are weakly interconnected._
- **Why does `sequelize` connect `Community 7` to `Community 0`, `Community 3`, `Community 6`, `Community 8`, `Community 13`?**
  _High betweenness centrality (0.117) - this node is a cross-community bridge._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.043478260869565216 - nodes in this community are weakly interconnected._
- **Should `Community 3` be split into smaller, more focused modules?**
  _Cohesion score 0.05555555555555555 - nodes in this community are weakly interconnected._