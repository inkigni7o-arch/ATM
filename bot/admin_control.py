import sqlite3
import os
from dotenv import load_dotenv
from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup
from telegram.ext import ContextTypes, ConversationHandler, CallbackQueryHandler, MessageHandler, filters
from telegram.constants import ParseMode

load_dotenv()
BOT_DB      = os.getenv("DB_PATH",      "./atm_bot.db")
SITE_DB     = os.getenv("SITE_DB_PATH", "../server/applications.db")
SUPER_ADMIN = int(os.getenv("SUPER_ADMIN_ID", "0"))

# ── States ─────────────────────────────────────
MENU_STATE = 0
WAIT_NAME  = 1
WAIT_LOGIN = 2
WAIT_PASS  = 3
WAIT_UID   = 4
WAIT_DEL_ID = 11


# ══════════════════════════════════════════════
#  DB helpers
# ══════════════════════════════════════════════

def _conn(path):
    c = sqlite3.connect(path)
    c.row_factory = sqlite3.Row
    return c

def db_all_admins():
    with _conn(BOT_DB) as c:
        return c.execute("SELECT * FROM bot_users ORDER BY created_at DESC").fetchall()

def db_get_admin(tid: int):
    with _conn(BOT_DB) as c:
        return c.execute("SELECT * FROM bot_users WHERE telegram_id=?", (tid,)).fetchone()

def db_add_bot_user(tid: int, full_name: str, created_by: int):
    with _conn(BOT_DB) as c:
        c.execute(
            "INSERT OR IGNORE INTO bot_users (telegram_id, full_name, role, created_by) VALUES (?,?,?,?)",
            (tid, full_name, "admin", created_by)
        )

def db_add_web_admin(login: str, password: str, full_name: str):
    with _conn(SITE_DB) as c:
        c.execute("""
            CREATE TABLE IF NOT EXISTS web_admins (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                login TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                full_name TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        """)
        c.execute(
            "INSERT OR IGNORE INTO web_admins (login, password, full_name) VALUES (?,?,?)",
            (login, password, full_name)
        )

def db_delete_admin(tid: int):
    with _conn(BOT_DB) as c:
        c.execute("DELETE FROM bot_users WHERE telegram_id=?", (tid,))

def db_web_login_exists(login: str) -> bool:
    with _conn(SITE_DB) as c:
        c.execute("""
            CREATE TABLE IF NOT EXISTS web_admins (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                login TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                full_name TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        """)
        row = c.execute("SELECT 1 FROM web_admins WHERE login=?", (login,)).fetchone()
        return row is not None


# ══════════════════════════════════════════════
#  Keyboards
# ══════════════════════════════════════════════

def _kb_main():
    return InlineKeyboardMarkup([
        [
            InlineKeyboardButton("➕ Yangi admin", callback_data="adm_create"),
            InlineKeyboardButton("🗑 O'chirish",   callback_data="adm_delete"),
        ],
        [InlineKeyboardButton("📋 Adminlar ro'yxati", callback_data="adm_list")],
    ])

def _kb_back():
    return InlineKeyboardMarkup([
        [InlineKeyboardButton("🔙 Orqaga", callback_data="adm_back")]
    ])

def _kb_confirm_add():
    return InlineKeyboardMarkup([
        [
            InlineKeyboardButton("✅ Tasdiqlash",   callback_data="adm_confirm"),
            InlineKeyboardButton("❌ Bekor qilish", callback_data="adm_back"),
        ]
    ])

def _kb_confirm_del(tid: int):
    return InlineKeyboardMarkup([
        [
            InlineKeyboardButton("🗑 Ha, o'chirish", callback_data=f"adm_delok:{tid}"),
            InlineKeyboardButton("❌ Bekor qilish",  callback_data="adm_back"),
        ]
    ])


# ══════════════════════════════════════════════
#  Screens
# ══════════════════════════════════════════════

def _admins_text():
    rows  = db_all_admins()
    count = len(rows)
    return (
        "━━━━━━━━━━━━━━━━━━━━━━\n"
        "👥  <b>ADMINLAR BOSHQARUVI</b>\n"
        "━━━━━━━━━━━━━━━━━━━━━━\n"
        f"📊 Jami adminlar: <b>{count}</b>\n\n"
        "Nima qilmoqchisiz?"
    )

def _step_text(step: int, total: int, title: str, hint: str) -> str:
    bar = "▰" * step + "▱" * (total - step)
    return (
        f"➕  <b>YANGI ADMIN QO'SHISH</b>\n"
        f"<code>{bar}</code>  {step}/{total}\n"
        "━━━━━━━━━━━━━━━━━━━━━━\n\n"
        f"<b>{title}</b>\n"
        f"<i>{hint}</i>"
    )

def _summary_text(d: dict) -> str:
    return (
        "━━━━━━━━━━━━━━━━━━━━━━\n"
        "📋  <b>TASDIQLASH</b>\n"
        "━━━━━━━━━━━━━━━━━━━━━━\n\n"
        f"👤 Ism:          <b>{d['name']}</b>\n"
        f"🔑 Login:        <code>{d['login']}</code>\n"
        f"🔒 Parol:        <code>{d['password']}</code>\n"
        f"🆔 Telegram ID:  <code>{d['uid']}</code>\n\n"
        "Ma'lumotlar to'g'rimi?"
    )


# ══════════════════════════════════════════════
#  Entry
# ══════════════════════════════════════════════

async def admins_menu(update: Update, context: ContextTypes.DEFAULT_TYPE):
    if update.message.from_user.id != SUPER_ADMIN:
        await update.message.reply_text("⛔️ Ruxsat yo'q.")
        return
    context.user_data.clear()
    await update.message.reply_text(
        _admins_text(), parse_mode=ParseMode.HTML, reply_markup=_kb_main()
    )
    return MENU_STATE


# ══════════════════════════════════════════════
#  List
# ══════════════════════════════════════════════

async def cb_list(update: Update, context: ContextTypes.DEFAULT_TYPE):
    q = update.callback_query
    await q.answer()
    rows = db_all_admins()
    if not rows:
        text = "━━━━━━━━━━━━━━━━━━━━━━\n📋  <b>ADMINLAR RO'YXATI</b>\n━━━━━━━━━━━━━━━━━━━━━━\n\n😶 Hozircha adminlar yo'q."
    else:
        lines = ["━━━━━━━━━━━━━━━━━━━━━━", "📋  <b>ADMINLAR RO'YXATI</b>", "━━━━━━━━━━━━━━━━━━━━━━", ""]
        for i, r in enumerate(rows, 1):
            name = r["full_name"] or f"ID {r['telegram_id']}"
            icon = "👑" if r["role"] == "superadmin" else "🛡"
            date = str(r["created_at"])[:10]
            lines += [f"{i}. {icon} <b>{name}</b>", f"    <code>{r['telegram_id']}</code>  •  {date}", ""]
        text = "\n".join(lines)
    await q.edit_message_text(text, parse_mode=ParseMode.HTML, reply_markup=_kb_back())
    return MENU_STATE


# ══════════════════════════════════════════════
#  Create — step by step
# ══════════════════════════════════════════════

async def cb_create_start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    q = update.callback_query
    await q.answer()
    context.user_data["new_admin"] = {}
    await q.edit_message_text(
        _step_text(1, 4, "Adminning ismini kiriting:", "Masalan: Alisher Karimov"),
        parse_mode=ParseMode.HTML, reply_markup=_kb_back()
    )
    return WAIT_NAME


async def receive_name(update: Update, context: ContextTypes.DEFAULT_TYPE):
    name = update.message.text.strip()
    context.user_data["new_admin"]["name"] = name
    await update.message.reply_text(
        _step_text(2, 4, "Login kiriting:", "Faqat lotin harflar va raqamlar. Masalan: ali_admin"),
        parse_mode=ParseMode.HTML, reply_markup=_kb_back()
    )
    return WAIT_LOGIN


async def receive_login(update: Update, context: ContextTypes.DEFAULT_TYPE):
    login = update.message.text.strip()
    if db_web_login_exists(login):
        await update.message.reply_text(
            f"⚠️ <code>{login}</code> login allaqachon band. Boshqa login kiriting:",
            parse_mode=ParseMode.HTML
        )
        return WAIT_LOGIN
    context.user_data["new_admin"]["login"] = login
    await update.message.reply_text(
        _step_text(3, 4, "Parol kiriting:", "Kamida 6 ta belgi bo'lsin"),
        parse_mode=ParseMode.HTML, reply_markup=_kb_back()
    )
    return WAIT_PASS


async def receive_password(update: Update, context: ContextTypes.DEFAULT_TYPE):
    pwd = update.message.text.strip()
    if len(pwd) < 6:
        await update.message.reply_text("❌ Parol kamida <b>6 ta belgi</b> bo'lishi kerak:", parse_mode=ParseMode.HTML)
        return WAIT_PASS
    context.user_data["new_admin"]["password"] = pwd
    await update.message.reply_text(
        _step_text(4, 4, "Telegram ID kiriting:", "💡 ID ni bilish uchun @userinfobot ga /start yuboring"),
        parse_mode=ParseMode.HTML, reply_markup=_kb_back()
    )
    return WAIT_UID


async def receive_uid(update: Update, context: ContextTypes.DEFAULT_TYPE):
    uid_str = update.message.text.strip()
    if not uid_str.isdigit():
        await update.message.reply_text("❌ Faqat <b>raqam</b> yuboring:", parse_mode=ParseMode.HTML)
        return WAIT_UID
    uid = int(uid_str)
    if uid == SUPER_ADMIN:
        await update.message.reply_text("⚠️ Bu superadmin ID si.")
        return WAIT_UID
    if db_get_admin(uid):
        await update.message.reply_text(f"⚠️ <code>{uid}</code> allaqachon admin!", parse_mode=ParseMode.HTML)
        return WAIT_UID
    context.user_data["new_admin"]["uid"] = uid
    await update.message.reply_text(
        _summary_text(context.user_data["new_admin"]),
        parse_mode=ParseMode.HTML, reply_markup=_kb_confirm_add()
    )
    return MENU_STATE


async def cb_confirm_add(update: Update, context: ContextTypes.DEFAULT_TYPE):
    q = update.callback_query
    await q.answer()
    d = context.user_data.get("new_admin", {})
    if not d:
        await q.edit_message_text("❌ Ma'lumotlar topilmadi.", reply_markup=_kb_back())
        return MENU_STATE

    db_add_bot_user(d["uid"], d["name"], q.from_user.id)
    db_add_web_admin(d["login"], d["password"], d["name"])
    context.user_data.clear()

    await q.edit_message_text(
        "━━━━━━━━━━━━━━━━━━━━━━\n"
        "✅  <b>ADMIN QO'SHILDI!</b>\n"
        "━━━━━━━━━━━━━━━━━━━━━━\n\n"
        f"👤 Ism:   <b>{d['name']}</b>\n"
        f"🔑 Login: <code>{d['login']}</code>\n"
        f"🆔 ID:    <code>{d['uid']}</code>\n\n"
        "Bot uchun: admin /start yuborganida tizimga kiradi.\n"
        "Sayt uchun: login va parol bilan kirishi mumkin.",
        parse_mode=ParseMode.HTML, reply_markup=_kb_back()
    )
    return MENU_STATE


# ══════════════════════════════════════════════
#  Delete
# ══════════════════════════════════════════════

async def cb_delete_start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    q = update.callback_query
    await q.answer()
    await q.edit_message_text(
        "━━━━━━━━━━━━━━━━━━━━━━\n"
        "🗑  <b>ADMIN O'CHIRISH</b>\n"
        "━━━━━━━━━━━━━━━━━━━━━━\n\n"
        "O'chirmoqchi bo'lgan adminning\n<b>Telegram ID</b> sini yuboring.",
        parse_mode=ParseMode.HTML, reply_markup=_kb_back()
    )
    return WAIT_DEL_ID


async def delete_receive_id(update: Update, context: ContextTypes.DEFAULT_TYPE):
    tid_str = update.message.text.strip()
    if not tid_str.isdigit():
        await update.message.reply_text("❌ Faqat <b>raqam</b> yuboring:", parse_mode=ParseMode.HTML)
        return WAIT_DEL_ID
    tid = int(tid_str)
    if tid == SUPER_ADMIN:
        await update.message.reply_text("⛔️ Superadminni o'chirib bo'lmaydi.")
        return MENU_STATE
    row = db_get_admin(tid)
    if not row:
        await update.message.reply_text(f"❌ <code>{tid}</code> ID li admin topilmadi.", parse_mode=ParseMode.HTML, reply_markup=_kb_back())
        return MENU_STATE
    name = row["full_name"] or f"ID {tid}"
    await update.message.reply_text(
        f"━━━━━━━━━━━━━━━━━━━━━━\n🗑  <b>TASDIQLASH</b>\n━━━━━━━━━━━━━━━━━━━━━━\n\n"
        f"👤 <b>{name}</b>\n🆔 ID: <code>{tid}</code>\n\n⚠️ O'chirishni tasdiqlaysizmi?",
        parse_mode=ParseMode.HTML, reply_markup=_kb_confirm_del(tid)
    )
    return MENU_STATE


async def cb_confirm_del(update: Update, context: ContextTypes.DEFAULT_TYPE):
    q = update.callback_query
    await q.answer()
    tid = int(q.data.split(":")[1])
    db_delete_admin(tid)
    await q.edit_message_text(
        f"━━━━━━━━━━━━━━━━━━━━━━\n✅  <b>ADMIN O'CHIRILDI</b>\n━━━━━━━━━━━━━━━━━━━━━━\n\n"
        f"🆔 ID: <code>{tid}</code> tizimdan o'chirildi.",
        parse_mode=ParseMode.HTML, reply_markup=_kb_back()
    )
    return MENU_STATE


# ══════════════════════════════════════════════
#  Back
# ══════════════════════════════════════════════

async def cb_back(update: Update, context: ContextTypes.DEFAULT_TYPE):
    q = update.callback_query
    await q.answer()
    context.user_data.clear()
    await q.edit_message_text(
        _admins_text(), parse_mode=ParseMode.HTML, reply_markup=_kb_main()
    )
    return MENU_STATE


# ══════════════════════════════════════════════
#  Single entry point
# ══════════════════════════════════════════════

def admins():
    callbacks = [
        CallbackQueryHandler(cb_list,        pattern="^adm_list$"),
        CallbackQueryHandler(cb_create_start, pattern="^adm_create$"),
        CallbackQueryHandler(cb_delete_start, pattern="^adm_delete$"),
        CallbackQueryHandler(cb_confirm_add,  pattern="^adm_confirm$"),
        CallbackQueryHandler(cb_confirm_del,  pattern=r"^adm_delok:\d+$"),
        CallbackQueryHandler(cb_back,         pattern="^adm_back$"),
    ]
    return ConversationHandler(
        entry_points=[MessageHandler(filters.TEXT & filters.Regex("^Admins$"), admins_menu)],
        states={
            MENU_STATE:   callbacks,
            WAIT_NAME:    [*callbacks, MessageHandler(filters.TEXT & ~filters.COMMAND, receive_name)],
            WAIT_LOGIN:   [*callbacks, MessageHandler(filters.TEXT & ~filters.COMMAND, receive_login)],
            WAIT_PASS:    [*callbacks, MessageHandler(filters.TEXT & ~filters.COMMAND, receive_password)],
            WAIT_UID:     [*callbacks, MessageHandler(filters.TEXT & ~filters.COMMAND, receive_uid)],
            WAIT_DEL_ID:  [*callbacks, MessageHandler(filters.TEXT & ~filters.COMMAND, delete_receive_id)],
        },
        fallbacks=[MessageHandler(filters.TEXT & filters.Regex("^Admins$"), admins_menu)],
        per_message=False,
        allow_reentry=True,
    )
