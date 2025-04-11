export function formatShortName(fullName: string): string {
    const [lastName, firstName, middleName] = fullName.split(" ")
    if (!lastName) return fullName
  
    const firstInitial = firstName ? firstName.charAt(0) + "." : ""
    const middleInitial = middleName ? middleName.charAt(0) + "." : ""
  
    return `${lastName} ${firstInitial}${middleInitial}`
  }
  