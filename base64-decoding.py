import base64

def base64_decode_with_padding(encoded_string):
    """
    Decodes a Base64 string, adding padding if necessary.

    Args:
        encoded_string: The Base64 encoded string.

    Returns:
        The decoded string (or bytes if decoding to string fails), or None if decoding fails.
    """
    try:
        # Add padding if necessary
        missing_padding = len(encoded_string) % 4
        if missing_padding:
            encoded_string += '=' * (4 - missing_padding)

        decoded_bytes = base64.b64decode(encoded_string)
        
        # Attempt to decode to string, if it fails return the bytes
        try:
            decoded_string = decoded_bytes.decode('utf-8')
            return decoded_string
        except UnicodeDecodeError:
            return decoded_bytes

    except Exception:
        return None

# Example usage
encoded_text = "ICAgICAgRFhRMSAgICAgICAgICAxMDcwMDAwMjQwICAgICAgICAyMDIzMDkyNiAgICAgICAgICAeHEFNMDQcQzIxMTExMTEcQzFUQVRQUxxDMzAxHEcyWR4cQU0wMRxDWDAxHENZMTIzNDU2Nzg5HEM0MTk1MTAxMDEcQzUxHENBQ1VTVE9NRVIcQ0JDQVNIHENNMSBTVFJFRVQgU1QcQ05DSVRZHENPU0McQ1AyOTMyMRxDUTg2NDEyMzQ1NjccNFgwMx0eHEFNMDccRU0xHEQyNjAwODY5MBxFMTAzHEQ3MDAzMzgwMDQzMDQcRTcwMDAwMDMwMDAwHEQzMDAcRDUzMBxENjEcRDgwHERFMjAyMzA5MjYcREYwMBxESjUcRFQyHDI4TUweHEFNMDMcRVowMRxEQjEyMzQ1ODc2OTMcRFJEHFBNODY0NTgyMTIzNBwyRTAxHERMMTIzNDU4NzY5Mxw0RUQcMksxNSBTTEFNIERVTksgTEFORRwyTVBoaWxhZGVscGhpYRwyTnBhHDJQMTIzNDU2Nzg5HhxBTTExHEQ5MkIcREM3NXscRTM2NDZEHERRMDAwMDAwMHscRFU3MjNGHEROMDEeHEFNMTUcOENOSEZBQ0lEHDNRT0xEIEFORCBERUNSRVBJVCBQTEFDRRw1SlJPRUJVQ0scM1ZTQxw2RDI5Mzc2HhxBTVhYHCZCQ0FTSBwmQ0EcJkY5ODc1MBwmR0YcJkgwMxwmSjk4NzUwTkgcJksxMzM5MzccJkxOHCZNThwmTjEyMzQ1Njc4OTMcJlQwHCZVMzQcJlYxMzcwMBwmV0McJlhOHCZZWVVSQhwmWjIwMjQwOTI1HCNBQxwjQkUcI0NBRjEyMzQ1NjMcI0UwMDAzMBwjRzAwMzM4MDA0MzA0HCNLQkUxMjc4MDg0HCNMMTIzNDU4NzY5MxwjTTIyHCNOMDEcI09ZHCNQThwjUTEyMzQ1Njc4ORwjUlNDRExOVU1CRVIcI1dEUlVHHCNYU3VmZmljaWVudBwjWVF1YW50dW0cI1pLU0McIUExNDMyNTY3ODkzHCFCU1RBVEUgTElDRU5TRRwhRjMwMDAwHCFRUk9FQlVDSxwhUlNDHCFTMjkzNzYD"
decoded_text = base64_decode_with_padding(encoded_text)

if decoded_text:
    print(f"Decoded text: {decoded_text}")
else:
    print("Decoding failed.")

encoded_data_with_invalid_chars = "ICAgICAgRFhRMSAgICAgICAgICAxMDcwMDAwMjQwICAgICAgICAyMDIzMDkyNiAgICAgICAgICAeHEFNMDQcQzIxMTExMTEcQzFUQVRQUxxDMzAxHEcyWR4cQU0wMRxDWDAxHENZMTIzNDU2Nzg5HEM0MTk1MTAxMDEcQzUxHENBQ1VTVE9NRVIcQ0JDQVNIHENNMSBTVFJFRVQgU1QcQ05DSVRZHENPU0McQ1AyOTMyMRxDUTg2NDEyMzQ1NjccNFgwMx0eHEFNMDccRU0xHEQyNjAwODY5MBxFMTAzHEQ3MDAzMzgwMDQzMDQcRTcwMDAwMDMwMDAwHEQzMDAcRDUzMBxENjEcRDgwHERFMjAyMzA5MjYcREYwMBxESjUcRFQyHDI4TUweHEFNMDMcRVowMRxEQjEyMzQ1ODc2OTMcRFJEHFBNODY0NTgyMTIzNBwyRTAxHERMMTIzNDU4NzY5Mxw0RUQcMksxNSBTTEFNIERVTksgTEFORRwyTVBoaWxhZGVscGhpYRwyTnBhHDJQMTIzNDU2Nzg5HhxBTTExHEQ5MkIcREM3NXscRTM2NDZEHERRMDAwMDAwMHscRFU3MjNGHEROMDEeHEFNMTUcOENOSEZBQ0lEHDNRT0xEIEFORCBERUNSRVBJVCBQTEFDRRw1SlJPRUJVQ0scM1ZTQxw2RDI5Mzc2HhxBTVhYHCZCQ0FTSBwmQ0EcJkY5ODc1MBwmR0YcJkgwMxwmSjk4NzUwTkgcJksxMzM5MzccJkxOHCZNThwmTjEyMzQ1Njc4OTMcJlQwHCZVMzQcJlYxMzcwMBwmV0McJlhOHCZZWVVSQhwmWjIwMjQwOTI1HCNBQxwjQkUcI0NBRjEyMzQ1NjMcI0UwMDAzMBwjRzAwMzM4MDA0MzA0HCNLQkUxMjc4MDg0HCNMMTIzNDU4NzY5MxwjTTIyHCNOMDEcI09ZHCNQThwjUTEyMzQ1Njc4ORwjUlNDRExOVU1CRVIcI1dEUlVHHCNYU3VmZmljaWVudBwjWVF1YW50dW0cI1pLU0McIUExNDMyNTY3ODkzHCFCU1RBVEUgTElDRU5TRRwhRjMwMDAwHCFRUk9FQlVDSxwhUlNDHCFTMjkzNzYD"
decoded_data = base64_decode_with_padding(encoded_data_with_invalid_chars)

if decoded_data:
     print(f"Decoded data: {decoded_data}")
else:
    print("Decoding failed.")
