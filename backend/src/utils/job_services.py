from rapidfuzz import process, fuzz

def syn_keyword_search (user_input:str, choices:list[str]):
    result = process.extractOne(user_input, choices, scorer = fuzz.WRatio)
    if (result):
        return result[0]
    return user_input