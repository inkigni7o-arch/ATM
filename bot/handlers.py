from telegram import Update, KeyboardButton, ReplyKeyboardMarkup
from telegram.ext import ContextTypes
import asyncio
import os
from dotenv import load_dotenv




load_dotenv()
Super_Admin = os.getenv("SUPER_ADMIN_ID")


async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    if update.message.from_user.id == int(Super_Admin):
        await show_menu(update, context)
    else:
        await update.message.reply_text("sizda admin ruhsati yoq")

    




async def show_menu(update: Update, context: ContextTypes.DEFAULT_TYPE):
    buttons = [[KeyboardButton("Admins")]]
    markup = ReplyKeyboardMarkup(buttons, resize_keyboard=True)
    await update.message.reply_text("Admin panel:", reply_markup=markup)