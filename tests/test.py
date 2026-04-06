from unittest import TestCase
from unittest.mock import sentinel
from sentinel import DEFAULT_STATE, SentinelSDK

class TryTesting(TestCase):

    # Default State Tests
    def test_get_default_state(self):
        assert DEFAULT_STATE == SentinelSDK.get_default_state(self)
    
    