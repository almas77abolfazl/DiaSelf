export function getMainKeyboardButtons(userId: number) {
  return [
    [
      {
        text: "Register!",
        callback_data: `REGISTER:${userId}`,
      },
    ],
  ];
}

export function getCancelButtonKeyboard(userId: number) {
  return [
    [
      {
        text: "Cancel!",
        callback_data: `CANCEL:${userId}`,
      },
    ],
  ];
}
