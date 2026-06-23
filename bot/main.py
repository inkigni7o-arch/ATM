from telegram.ext import (ApplicationBuilder, CommandHandler, MessageHandler, CallbackQueryHandler, ContextTypes,
                          filters)
from telegram import Update
from telegram.request import HTTPXRequest
import os
from dotenv import load_dotenv
import asyncio

from handlers import start
from admin_control import admins

asyncio.set_event_loop(asyncio.new_event_loop())

load_dotenv()
Token = os.getenv("BOT_TOKEN")

async def on_startup(app):
    print("✅ Бот запущен")
    await app.bot.set_my_commands([
        ("start", "Запустить бота")
    ])

request = HTTPXRequest(
    connect_timeout=20,
    read_timeout=120,
    write_timeout=20,
    pool_timeout=20
)

app = (
    ApplicationBuilder()
    .token(Token)
    .post_init(on_startup)
    .request(request)
    .build()
)

async def error_handler(update: Update, context: ContextTypes.DEFAULT_TYPE):
    import traceback
    from datetime import datetime
    error_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    print(f"\n‼️[{error_time}] Ошибка в Telegram боте:")
    print("-" * 80)
    print(f"Тип ошибки: {type(context.error).__name__}")
    print(f"Описание: {context.error}")
    print("Стек вызовов:")
    traceback.print_exc()
    print("-" * 80)
    msg = "⚠️ Произошла ошибка. Попробуйте снова."
    if update and update.callback_query:
        await update.callback_query.message.reply_text(msg)
    elif update and update.message:
        await update.message.reply_text(msg)









app.add_error_handler(error_handler)
app.add_handler(CommandHandler("start", start))
app.add_handler(admins())


if __name__ == "__main__":
    app.run_polling()